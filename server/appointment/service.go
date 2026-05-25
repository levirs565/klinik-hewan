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
	ErrPetNotFound         = errors.New("pet not found or does not belong to you")
	ErrAppointmentNotFound = errors.New("appointment not found or does not belong to you")
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

func (s *Service) GetOwnerAppointments(ctx context.Context, ownerID uint, filter string) (*GetOwnerAppointmentsResponse, error) {
	query := gorm.G[models.Appointment](s.db).
		Select("appointments.id", "current_state", "service_type", "appointment_date").
		Joins(clause.JoinTarget{Association: "Pet"}, func(db gorm.JoinBuilder, joinTable, curTable clause.Table) error {
			db.Select("id", "name", "breed", "avatar_id")
			return nil
		}).
		Where("`Pet`.owner_id = ?", ownerID)

	today := time.Now().Format("2006-01-02")
	switch filter {
	case "upcoming":
		query = query.Where("appointments.appointment_date >= ?", today)
	case "past":
		query = query.Where("appointments.appointment_date < ?", today)
	}

	appointments, err := query.
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

func (s *Service) GetAppointmentDetail(ctx context.Context, ownerID uint, appointmentID uuid.UUID) (*AppointmentDetailResponse, error) {
	app, err := gorm.G[models.Appointment](s.db).
		Select("appointments.id", "current_state", "service_type", "appointment_date", "owner_notes", "previous_medical_history").
		Joins(clause.JoinTarget{Association: "Pet"}, func(db gorm.JoinBuilder, joinTable, curTable clause.Table) error {
			db.Select("id", "name", "breed", "avatar_id", "birth_date")
			return nil
		}).
		Joins(clause.JoinTarget{Association: "Doctor.InternalUser", Type: clause.LeftJoin}, func(db gorm.JoinBuilder, joinTable, curTable clause.Table) error {
			db.Select("id", "full_name")
			return nil
		}).
		Where("appointments.id = ? AND `Pet`.owner_id = ?", appointmentID, ownerID).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrAppointmentNotFound
		}
		return nil, err
	}

	response := &AppointmentDetailResponse{
		ID: app.ID,
		Pet: AppointmentDetailPet{
			ID:        app.Pet.ID,
			Name:      app.Pet.Name,
			Breed:     app.Pet.Breed,
			BirthDate: core.Date(app.Pet.BirthDate),
			AvatarURL: s.s3.GetPetAvatarURL(ctx, app.Pet.ID, app.Pet.AvatarID),
		},
		Status:                 string(app.CurrentState),
		ServiceType:            app.ServiceType,
		AppointmentDate:        core.Date(app.AppointmentDate),
		OwnerNotes:             app.OwnerNotes,
		PreviousMedicalHistory: app.PreviousMedicalHistory,
	}

	if app.Doctor != nil && app.Doctor.InternalUser.ID != 0 {
		response.Doctor = &AppointmentDoctorSummary{
			ID:   app.Doctor.InternalUser.ID,
			Name: app.Doctor.InternalUser.FullName,
		}
	}

	return response, nil
}
