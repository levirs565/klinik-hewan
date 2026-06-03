package pet

import (
	"context"
	"errors"
	"fmt"
	"time"
	"vetconnect-server/core"
	"vetconnect-server/models"

	"github.com/google/uuid"
	"github.com/samber/lo"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

var (
	ErrAvatarNotFound = errors.New("avatar file not found in temporary storage")
	ErrPetNotFound    = errors.New("pet not found")
)

type Service struct {
	db *gorm.DB
	s  *core.S3Helper
}

func NewService(db *gorm.DB, s3 *core.S3Helper) *Service {
	return &Service{db: db, s: s3}
}

func (s *Service) GetPresignedURL(ctx context.Context, userID uint, contentType string, size int64) (*GetPresignedURLResponse, error) {
	uploadID := uuid.New().String()
	key := s.s.GetTempAvatarKey(userID, uploadID)

	presigned, err := s.s.GeneratePresignedPutURL(ctx, key, contentType, size, 15*time.Minute)
	if err != nil {
		return nil, err
	}

	return &GetPresignedURLResponse{
		UploadID: uploadID,
		URL:      presigned.URL,
		Method:   presigned.Method,
		Headers:  presigned.Headers,
	}, nil
}

func (s *Service) CreatePet(ctx context.Context, ownerID uint, req CreatePetRequest) (*PetResponse, error) {
	pet := models.Pet{
		OwnerID:               ownerID,
		Name:                  req.Name,
		Species:               req.Species,
		Breed:                 req.Breed,
		Gender:                req.Gender,
		BirthDate:             datatypes.Date(req.BirthDate.Time()),
		InitialMedicalHistory: req.InitialMedicalHistory,
	}

	var sourceKey string
	if req.AvatarUploadID != "" {
		sourceKey = s.s.GetTempAvatarKey(ownerID, req.AvatarUploadID)
		exists, err := s.s.FileExists(ctx, sourceKey)
		if err != nil {
			return nil, fmt.Errorf("failed to check avatar file: %w", err)
		}
		if !exists {
			return nil, ErrAvatarNotFound
		}
		pet.AvatarID = req.AvatarUploadID
	}

	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := gorm.G[models.Pet](tx).Create(ctx, &pet); err != nil {
			return err
		}

		if pet.AvatarID != "" {
			permanentKey := s.s.GetPermanentAvatarKey(pet.ID, pet.AvatarID)
			if err := s.s.MoveObject(ctx, sourceKey, permanentKey); err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return s.MapToResponse(ctx, pet), nil
}

func (s *Service) GetPetDetail(ctx context.Context, ownerID uint, petID uint) (*PetResponse, error) {
	pet, err := gorm.G[models.Pet](s.db).Where("id = ? AND owner_id = ?", petID, ownerID).First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPetNotFound
		}
		return nil, err
	}

	return s.MapToResponse(ctx, pet), nil
}

// TODO: Maybe we need to delete avatar? We need check frontend
func (s *Service) UpdatePet(ctx context.Context, ownerID uint, petID uint, req CreatePetRequest) (*PetResponse, error) {
	pet, err := gorm.G[models.Pet](s.db).Where("id = ? AND owner_id = ?", petID, ownerID).First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPetNotFound
		}
		return nil, err
	}

	oldAvatarID := pet.AvatarID
	pet.Name = req.Name
	pet.Species = req.Species
	pet.Breed = req.Breed
	pet.Gender = req.Gender
	pet.BirthDate = datatypes.Date(req.BirthDate.Time())
	pet.InitialMedicalHistory = req.InitialMedicalHistory

	var sourceKey string
	if req.AvatarUploadID != "" && req.AvatarUploadID != oldAvatarID {
		sourceKey = s.s.GetTempAvatarKey(ownerID, req.AvatarUploadID)
		exists, err := s.s.FileExists(ctx, sourceKey)
		if err != nil {
			return nil, fmt.Errorf("failed to check avatar file: %w", err)
		}
		if !exists {
			return nil, ErrAvatarNotFound
		}
		pet.AvatarID = req.AvatarUploadID
	}

	err = s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		rows, err := gorm.G[models.Pet](tx).Updates(ctx, pet)
		if err != nil {
			return err
		}
		if rows == 0 {
			return ErrPetNotFound
		}

		if pet.AvatarID != "" && pet.AvatarID != oldAvatarID {
			permanentKey := s.s.GetPermanentAvatarKey(pet.ID, pet.AvatarID)
			if err := s.s.MoveObject(ctx, sourceKey, permanentKey); err != nil {
				return err
			}

			if oldAvatarID != "" {
				oldKey := s.s.GetPermanentAvatarKey(pet.ID, oldAvatarID)
				if err := s.s.DeleteObject(ctx, oldKey); err != nil {
					fmt.Printf("warning: failed to delete old avatar %s: %v\n", oldKey, err)
				}
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return s.MapToResponse(ctx, pet), nil
}

func (s *Service) GetMyPets(ctx context.Context, ownerID uint) ([]MyPetResponse, error) {
	pets, err := gorm.G[models.Pet](s.db).Where("owner_id = ?", ownerID).Find(ctx)
	if err != nil {
		return nil, err
	}

	responses := lo.Map(pets, func(pet models.Pet, _ int) MyPetResponse {
		res := MyPetResponse{
			ID:        pet.ID,
			Name:      pet.Name,
			Species:   pet.Species,
			BirthDate: core.Date(pet.BirthDate),
			AvatarURL: s.s.GetPetAvatarURL(ctx, pet.ID, pet.AvatarID),
		}

		return res
	})

	return responses, nil
}

func (s *Service) GetPetReminders(ctx context.Context, ownerID uint, petID uint) ([]PetReminderResponse, error) {
	// Validate pet ownership first
	_, err := gorm.G[models.Pet](s.db).
		Select("id").
		Where("id = ? AND owner_id = ?", petID, ownerID).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPetNotFound
		}
		return nil, err
	}

	reminders, err := gorm.G[models.Reminder](s.db).
		Select("id", "service_type", "reminder_date", "description").
		Where("pet_id = ? AND fulfilling_appointment_id IS NULL", petID).
		Order("reminder_date ASC").
		Find(ctx)

	if err != nil {
		return nil, err
	}

	return lo.Map(reminders, func(r models.Reminder, _ int) PetReminderResponse {
		return PetReminderResponse{
			ID:          r.ID,
			ServiceType: r.ServiceType,
			Date:        core.Date(r.ReminderDate),
			Description: r.Description,
		}
	}), nil
}

func (s *Service) MapToResponse(ctx context.Context, pet models.Pet) *PetResponse {
	res := &PetResponse{
		ID:                    pet.ID,
		OwnerID:               pet.OwnerID,
		Name:                  pet.Name,
		Species:               pet.Species,
		Breed:                 pet.Breed,
		Gender:                pet.Gender,
		BirthDate:             core.Date(pet.BirthDate),
		InitialMedicalHistory: pet.InitialMedicalHistory,
		CreatedAt:             pet.CreatedAt,
		AvatarURL:             s.s.GetPetAvatarURL(ctx, pet.ID, pet.AvatarID),
	}

	return res
}
