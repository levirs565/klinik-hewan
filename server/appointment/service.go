package appointment

import (
	"context"
	"errors"
	"time"
	"vetconnect-server/core"
	"vetconnect-server/models"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var (
	ErrPetNotFound = errors.New("pet not found or does not belong to you")
)

type Service struct {
	db    *gorm.DB
	mongo *core.MongoStorage
	s3    *core.S3Helper
}

func NewService(db *gorm.DB, mongo *core.MongoStorage, s3 *core.S3Helper) *Service {
	return &Service{
		db:    db,
		mongo: mongo,
		s3:    s3,
	}
}

func (s *Service) CreateAppointment(ctx context.Context, ownerID uint, req CreateAppointmentRequest) (*CreateAppointmentResponse, error) {
	_, err := gorm.G[models.Pet](s.db).Where("id = ? AND owner_id = ?", req.PetID, ownerID).First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPetNotFound
		}
		return nil, err
	}

	appointmentID := uuid.New()
	reservationDoc := models.AppointmentReservation{
		AppointmentID: appointmentID.String(),
		ServiceType:   req.ServiceType,
		CreatedAt:     time.Now(),
	}

	if req.Checkup != nil {
		reservationDoc.Checkup = &models.CheckupReservationDetails{
			Purpose:   req.Checkup.Purpose,
			FocusArea: req.Checkup.FocusArea,
		}
	} else if req.Treatment != nil {
		reservationDoc.Treatment = &models.TreatmentReservationDetails{
			ObservedSymptoms: req.Treatment.ObservedSymptoms,
			SymptomDuration:  req.Treatment.SymptomDuration,
			HomeCareReceived: req.Treatment.HomeCareReceived,
		}
	} else if req.Vaccine != nil {
		reservationDoc.Vaccine = &models.VaccineReservationDetails{
			VaccineType: req.Vaccine.VaccineType,
		}
	}

	appointmentDate := req.AppointmentDate.Time()

	err = s.db.Transaction(func(tx *gorm.DB) error {
		appointment := models.Appointment{
			ID:                     appointmentID,
			PetID:                  req.PetID,
			ServiceType:            req.ServiceType,
			AppointmentDate:        datatypes.Date(appointmentDate),
			OwnerNotes:             req.OwnerNotes,
			PreviousMedicalHistory: req.PreviousMedicalHistory,
			CurrentState:           models.StateWaitingConfirmation,
		}

		if err := gorm.G[models.Appointment](tx).Create(ctx, &appointment); err != nil {
			return err
		}

		if _, err := s.mongo.AppointmentReservations.InsertOne(ctx, reservationDoc); err != nil {
			return err
		}

		statusLog := models.StatusHistory{
			AppointmentID: appointmentID.String(),
			State:         models.StateWaitingConfirmation,
			ActorID:       ownerID,
			ActorRole:     string(models.RoleOwner),
			ChangedAt:     time.Now(),
		}

		if _, err := s.mongo.StatusHistories.InsertOne(ctx, statusLog); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &CreateAppointmentResponse{
		ID: appointmentID,
	}, nil
}

func (s *Service) GetOwnerAppointments(ctx context.Context, ownerID uint) (*GetOwnerAppointmentsResponse, error) {
	appointments, err := gorm.G[models.Appointment](s.db).
		Joins(clause.JoinTarget{Association: "Pet"}, func(db gorm.JoinBuilder, joinTable, curTable clause.Table) error {
			db.Select("id", "name", "breed", "avatar_id")
			return nil
		}).
		Where("`Pet`.owner_id = ?", ownerID).
		Order("appointments.appointment_date DESC, appointments.created_at DESC").
		Find(ctx)

	if err != nil {
		return nil, err
	}

	items := make([]AppointmentListItem, len(appointments))
	for i, app := range appointments {
		items[i] = AppointmentListItem{
			ID: app.ID,
			Pet: AppointmentPetSummary{
				Name:      app.Pet.Name,
				Breed:     app.Pet.Breed,
				AvatarURL: s.s3.GetPetAvatarURL(ctx, app.Pet.ID, app.Pet.AvatarID),
			},
			Status:          string(app.CurrentState),
			ServiceType:     app.ServiceType,
			AppointmentDate: core.Date(app.AppointmentDate),
		}
	}

	return &GetOwnerAppointmentsResponse{
		Items: items,
	}, nil
}
