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
	ErrPetNotFound             = errors.New("pet not found or does not belong to you")
	ErrAppointmentNotFound     = errors.New("appointment not found or does not belong to you")
	ErrInvalidAppointmentState = errors.New("appointment is not in waiting confirmation state")
	ErrDoctorNotFound          = errors.New("doctor not found")
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
			ActorRole:     models.RoleOwner,
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
			Status:          app.CurrentState,
			ServiceType:     app.ServiceType,
			AppointmentDate: core.Date(app.AppointmentDate),
		}
	}

	return &GetOwnerAppointmentsResponse{
		Items: items,
	}, nil
}

func (s *Service) GetAllAppointments(ctx context.Context, status models.AppointmentState, date string, doctorID *uint) ([]AppointmentListItem, error) {
	query := gorm.G[models.Appointment](s.db).
		Select("id", "current_state", "service_type", "appointment_date", "pet_id").
		Preload("Pet", func(db gorm.PreloadBuilder) error {
			db.Select("id", "name", "breed", "avatar_id")
			return nil
		})

	if status != "" {
		query = query.Where("current_state = ?", status)
	}
	if date != "" {
		query = query.Where("appointment_date = ?", date)
	}
	if doctorID != nil {
		query = query.Where("doctor_id = ?", *doctorID)
	}

	appointments, err := query.
		Order("appointment_date DESC, created_at DESC").
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
			Status:          app.CurrentState,
			ServiceType:     app.ServiceType,
			AppointmentDate: core.Date(app.AppointmentDate),
		}
	}

	return items, nil
}

func (s *Service) GetInternalAppointmentDetail(ctx context.Context, appointmentID uuid.UUID) (*InternalAppointmentDetailResponse, error) {
	app, err := gorm.G[models.Appointment](s.db).
		Select("id", "pet_id", "doctor_id", "current_state", "service_type", "appointment_date", "owner_notes", "previous_medical_history").
		Preload("Pet", func(db gorm.PreloadBuilder) error {
			db.Select("id", "name", "breed", "avatar_id", "birth_date", "owner_id")
			return nil
		}).
		Preload("Pet.Owner", func(db gorm.PreloadBuilder) error {
			db.Select("id", "full_name", "avatar_id")
			return nil
		}).
		Preload("Doctor.InternalUser", func(db gorm.PreloadBuilder) error {
			db.Select("id", "full_name")
			return nil
		}).
		Where("id = ?", appointmentID).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrAppointmentNotFound
		}
		return nil, err
	}

	response := &InternalAppointmentDetailResponse{
		AppointmentDetailResponse: AppointmentDetailResponse{
			ID: app.ID,
			Pet: AppointmentDetailPet{
				ID:        app.Pet.ID,
				Name:      app.Pet.Name,
				Breed:     app.Pet.Breed,
				BirthDate: core.Date(app.Pet.BirthDate),
				AvatarURL: s.s3.GetPetAvatarURL(ctx, app.Pet.ID, app.Pet.AvatarID),
			},
			Status:                 app.CurrentState,
			ServiceType:            app.ServiceType,
			AppointmentDate:        core.Date(app.AppointmentDate),
			OwnerNotes:             app.OwnerNotes,
			PreviousMedicalHistory: app.PreviousMedicalHistory,
		},
		Owner: AppointmentOwnerSummary{
			ID:        app.Pet.Owner.ID,
			Name:      app.Pet.Owner.FullName,
			AvatarURL: s.s3.GetOwnerAvatarURL(ctx, app.Pet.Owner.ID, app.Pet.Owner.AvatarID),
		},
	}

	if app.Doctor != nil && app.Doctor.InternalUser.ID != 0 {
		response.Doctor = &AppointmentDoctorSummary{
			ID:   app.Doctor.InternalUser.ID,
			Name: app.Doctor.InternalUser.FullName,
		}
	}

	return response, nil
}

func (s *Service) ApproveAppointment(ctx context.Context, receptionistID uint, appointmentID uuid.UUID) error {
	app, err := gorm.G[models.Appointment](s.db).
		Select("id", "current_state").
		Where("id = ?", appointmentID).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrAppointmentNotFound
		}
		return err
	}

	if app.CurrentState != models.StateWaitingConfirmation {
		return ErrInvalidAppointmentState
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		// Update appointment state
		_, err := gorm.G[models.Appointment](tx).
			Where("id = ?", appointmentID).
			Update(ctx, "current_state", models.StateAccepted)

		if err != nil {
			return err
		}

		// Log status history
		statusLog := models.StatusHistory{
			AppointmentID: appointmentID.String(),
			State:         models.StateAccepted,
			ActorID:       receptionistID,
			ActorRole:     models.RoleReceptionist,
			ChangedAt:     time.Now(),
		}

		if _, err := s.mongo.StatusHistories.InsertOne(ctx, statusLog); err != nil {
			return err
		}

		return nil
	})
}

func (s *Service) RejectAppointment(ctx context.Context, receptionistID uint, appointmentID uuid.UUID, reason string) error {
	app, err := gorm.G[models.Appointment](s.db).
		Select("id", "current_state").
		Where("id = ?", appointmentID).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrAppointmentNotFound
		}
		return err
	}

	if app.CurrentState != models.StateWaitingConfirmation {
		return ErrInvalidAppointmentState
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		// Update appointment state
		_, err := gorm.G[models.Appointment](tx).
			Where("id = ?", appointmentID).
			Update(ctx, "current_state", models.StateRejected)

		if err != nil {
			return err
		}

		// Log status history
		statusLog := models.StatusHistory{
			AppointmentID: appointmentID.String(),
			State:         models.StateRejected,
			ActorID:       receptionistID,
			ActorRole:     models.RoleReceptionist,
			ChangedAt:     time.Now(),
			Reason:        reason,
		}

		if _, err := s.mongo.StatusHistories.InsertOne(ctx, statusLog); err != nil {
			return err
		}

		return nil
	})
}

func (s *Service) SelectDoctor(ctx context.Context, receptionistID uint, appointmentID uuid.UUID, doctorID uint) error {
	app, err := gorm.G[models.Appointment](s.db).
		Select("id", "current_state").
		Where("id = ?", appointmentID).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrAppointmentNotFound
		}
		return err
	}

	if app.CurrentState != models.StateAccepted {
		return errors.New("appointment must be in accepted state to select a doctor")
	}

	// Verify doctor exists
	_, err = gorm.G[models.DoctorProfile](s.db).
		Select("internal_user_id").
		Where("internal_user_id = ?", doctorID).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrDoctorNotFound
		}
		return err
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		// Update appointment doctor and state
		_, err := gorm.G[models.Appointment](tx).
			Where("id = ?", appointmentID).
			Updates(ctx, models.Appointment{
				DoctorID:     &doctorID,
				CurrentState: models.StateWaitingDoctor,
			})

		if err != nil {
			return err
		}

		// Log status history
		statusLog := models.StatusHistory{
			AppointmentID: appointmentID.String(),
			State:         models.StateWaitingDoctor,
			ActorID:       receptionistID,
			ActorRole:     models.RoleReceptionist,
			ChangedAt:     time.Now(),
		}

		if _, err := s.mongo.StatusHistories.InsertOne(ctx, statusLog); err != nil {
			return err
		}

		return nil
	})
}

func (s *Service) DoctorApproveAppointment(ctx context.Context, internalUserID uint, appointmentID uuid.UUID) error {
	// Need to find the DoctorProfile ID for the internal user
	doctorProfile, err := gorm.G[models.DoctorProfile](s.db).
		Select("internal_user_id").
		Where("internal_user_id = ?", internalUserID).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("doctor profile not found")
		}
		return err
	}

	app, err := gorm.G[models.Appointment](s.db).
		Select("id", "current_state", "doctor_id").
		Where("id = ?", appointmentID).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrAppointmentNotFound
		}
		return err
	}

	if app.CurrentState != models.StateWaitingDoctor {
		return errors.New("appointment is not in waiting doctor state")
	}

	if app.DoctorID == nil || *app.DoctorID != doctorProfile.InternalUserID {
		return errors.New("appointment is not assigned to you")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		// Update appointment state to InTreatment
		_, err := gorm.G[models.Appointment](tx).
			Where("id = ?", appointmentID).
			Updates(ctx, models.Appointment{
				CurrentState: models.StateInTreatment,
			})

		if err != nil {
			return err
		}

		// Log status history
		statusLog := models.StatusHistory{
			AppointmentID: appointmentID.String(),
			State:         models.StateInTreatment,
			ActorID:       internalUserID,
			ActorRole:     models.RoleDoctor,
			ChangedAt:     time.Now(),
		}

		if _, err := s.mongo.StatusHistories.InsertOne(ctx, statusLog); err != nil {
			return err
		}

		return nil
	})
}

func (s *Service) DoctorRejectAppointment(ctx context.Context, internalUserID uint, appointmentID uuid.UUID, reason string) error {
	// Need to find the DoctorProfile ID for the internal user
	doctorProfile, err := gorm.G[models.DoctorProfile](s.db).
		Select("internal_user_id").
		Where("internal_user_id = ?", internalUserID).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("doctor profile not found")
		}
		return err
	}

	app, err := gorm.G[models.Appointment](s.db).
		Select("id", "current_state", "doctor_id").
		Where("id = ?", appointmentID).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrAppointmentNotFound
		}
		return err
	}

	if app.CurrentState != models.StateWaitingDoctor {
		return errors.New("appointment is not in waiting doctor state")
	}

	if app.DoctorID == nil || *app.DoctorID != doctorProfile.InternalUserID {
		return errors.New("appointment is not assigned to you")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		// Update appointment state back to Accepted (so receptionist can re-assign)
		// and clear the doctor id
		_, err := gorm.G[models.Appointment](tx).
			Where("id = ?", appointmentID).
			Updates(ctx, models.Appointment{
				CurrentState: models.StateAccepted,
				DoctorID:     nil,
			})

		if err != nil {
			return err
		}

		// Log status history with reason
		statusLog := models.StatusHistory{
			AppointmentID: appointmentID.String(),
			State:         models.StateAccepted, // We move it back to accepted
			ActorID:       internalUserID,
			ActorRole:     models.RoleDoctor,
			ChangedAt:     time.Now(),
			Reason:        reason,
		}

		if _, err := s.mongo.StatusHistories.InsertOne(ctx, statusLog); err != nil {
			return err
		}

		return nil
	})
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
		Status:                 app.CurrentState,
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

func (s *Service) SaveMedicalRecord(ctx context.Context, internalUserID uint, appointmentID uuid.UUID, req SaveMedicalRecordRequest) error {
	// 1. Get Appointment
	app, err := gorm.G[models.Appointment](s.db).
		Select("id", "current_state", "doctor_id", "service_type", "pet_id").
		Where("id = ?", appointmentID).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrAppointmentNotFound
		}
		return err
	}

	// 2. Validate State
	if app.CurrentState != models.StateInTreatment {
		return errors.New("appointment is not in treatment state")
	}

	// 3. Validate Doctor
	if app.DoctorID == nil || *app.DoctorID != internalUserID {
		return errors.New("appointment is not assigned to you")
	}

	// 4. Validate Service Data match with Service Type
	medicalRecordDoc := models.MedicalRecord{
		AppointmentID: appointmentID.String(),
		PhysicalExamination: models.PhysicalExamination{
			Weight:            req.PhysicalExamination.Weight,
			Temperature:       req.PhysicalExamination.Temperature,
			PhysicalCondition: req.PhysicalExamination.PhysicalCondition,
			HeartRate:         req.PhysicalExamination.HeartRate,
			RespiratoryRate:   req.PhysicalExamination.RespiratoryRate,
		},
		Type:      app.ServiceType,
		CreatedAt: time.Now(),
	}

	switch app.ServiceType {
	case models.ServiceTypeVaccine:
		if req.Vaccine == nil {
			return errors.New("vaccine data is required for vaccine service")
		}
		medicalRecordDoc.Vaccine = &models.VaccineMedicalData{
			VaccineType:         req.Vaccine.VaccineType,
			Brand:               req.Vaccine.Brand,
			BatchNumber:         req.Vaccine.BatchNumber,
			AdministrationDate:  req.Vaccine.AdministrationDate.Time(),
			PreVaccineCondition: req.Vaccine.PreVaccineCondition,
			PostVaccineReaction: req.Vaccine.PostVaccineReaction,
		}
	case models.ServiceTypeCheckup:
		if req.Checkup == nil {
			return errors.New("checkup data is required for checkup service")
		}
		medicalRecordDoc.Checkup = &models.CheckupMedicalData{
			Palpation:                   req.Checkup.Palpation,
			CleanlinessNotes:            req.Checkup.CleanlinessNotes,
			NutritionRecommendations:    req.Checkup.NutritionRecommendations,
			PeriodicCareRecommendations: req.Checkup.PeriodicCareRecommendations,
		}
	case models.ServiceTypeTreatment:
		if req.Treatment == nil {
			return errors.New("treatment data is required for treatment service")
		}
		prescriptions := make([]models.Prescription, len(req.Treatment.Prescriptions))
		for i, p := range req.Treatment.Prescriptions {
			prescriptions[i] = models.Prescription{
				Name:      p.Name,
				Dosage:    p.Dosage,
				Frequency: p.Frequency,
			}
		}
		medicalRecordDoc.Treatment = &models.TreatmentMedicalData{
			ClinicalSymptoms: req.Treatment.ClinicalSymptoms,
			Diagnosis:        req.Treatment.Diagnosis,
			MedicalActions:   req.Treatment.MedicalActions,
			Prescriptions:    prescriptions,
			HomeCareNotes:    req.Treatment.HomeCareNotes,
			EstimatedCost:    req.Treatment.EstimatedCost,
		}
	}

	// 5. Transaction
	return s.db.Transaction(func(tx *gorm.DB) error {
		// a. Save Medical Record to Mongo
		if _, err := s.mongo.MedicalRecords.InsertOne(ctx, medicalRecordDoc); err != nil {
			return err
		}

		// b. Save Reminders to MySQL
		for _, r := range req.Reminders {
			reminder := models.Reminder{
				ID:                  uuid.New(),
				PetID:               app.PetID,
				SourceAppointmentID: appointmentID,
				ServiceType:         r.ServiceType,
				Description:         r.Description,
				ReminderDate:        datatypes.Date(r.ReminderDate.Time()),
			}
			if err := gorm.G[models.Reminder](tx).Create(ctx, &reminder); err != nil {
				return err
			}
		}

		// c. Update Appointment State to Finished
		_, err := gorm.G[models.Appointment](tx).
			Where("id = ?", appointmentID).
			Update(ctx, "current_state", models.StateFinished)
		if err != nil {
			return err
		}

		// d. Log Status History
		statusLog := models.StatusHistory{
			AppointmentID: appointmentID.String(),
			State:         models.StateFinished,
			ActorID:       internalUserID,
			ActorRole:     models.RoleDoctor,
			ChangedAt:     time.Now(),
		}
		if _, err := s.mongo.StatusHistories.InsertOne(ctx, statusLog); err != nil {
			return err
		}

		return nil
	})
}
