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
)

var (
	ErrPetNotFound = errors.New("pet not found or does not belong to you")
)

type Service struct {
	db    *gorm.DB
	mongo *core.MongoStorage
}

func NewService(db *gorm.DB, mongo *core.MongoStorage) *Service {
	return &Service{
		db:    db,
		mongo: mongo,
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

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &CreateAppointmentResponse{
		ID: appointmentID,
	}, nil
}
