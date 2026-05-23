package pet

import (
	"context"
	"errors"
	"fmt"
	"time"
	"vetconnect-server/core"
	"vetconnect-server/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrAvatarNotFound = errors.New("avatar file not found in temporary storage")
)

type Service struct {
	db *gorm.DB
	s  *core.S3Helper
}

func NewService(db *gorm.DB, s3 *core.S3Helper) *Service {
	return &Service{db: db, s: s3}
}

func (s *Service) getTempAvatarKey(userID uint, uploadID string) string {
	return fmt.Sprintf("temp/%d/pet_avatar/%s", userID, uploadID)
}

func (s *Service) getPermanentAvatarKey(petID uint, uploadID string) string {
	return fmt.Sprintf("pets/%d/avatar/%s", petID, uploadID)
}

func (s *Service) GetPresignedURL(ctx context.Context, userID uint, contentType string, size int64) (*GetPresignedURLResponse, error) {
	uploadID := uuid.New().String()
	key := s.getTempAvatarKey(userID, uploadID)

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
		BirthDate:             req.BirthDate,
		HairColor:             req.HairColor,
		InitialMedicalHistory: req.InitialMedicalHistory,
	}

	var sourceKey string
	if req.AvatarUploadID != "" {
		sourceKey = s.getTempAvatarKey(ownerID, req.AvatarUploadID)
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
		if err := tx.Create(&pet).Error; err != nil {
			return err
		}

		if pet.AvatarID != "" {
			permanentKey := s.getPermanentAvatarKey(pet.ID, pet.AvatarID)
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

func (s *Service) MapToResponse(ctx context.Context, pet models.Pet) *PetResponse {
	res := &PetResponse{
		ID:                    pet.ID,
		OwnerID:               pet.OwnerID,
		Name:                  pet.Name,
		Species:               pet.Species,
		Breed:                 pet.Breed,
		Gender:                pet.Gender,
		BirthDate:             pet.BirthDate,
		HairColor:             pet.HairColor,
		InitialMedicalHistory: pet.InitialMedicalHistory,
		CreatedAt:             pet.CreatedAt,
	}

	if pet.AvatarID != "" {
		permanentKey := s.getPermanentAvatarKey(pet.ID, pet.AvatarID)
		// Generate presigned GET URL since file is private
		url, err := s.s.GeneratePresignedGetURL(ctx, permanentKey, 1*time.Hour)
		if err != nil {
			// Log error but don't fail the whole response, just leave URL empty
			fmt.Printf("warning: failed to generate presigned GET url for pet %d: %v\n", pet.ID, err)
		} else {
			res.AvatarURL = url
		}
	}

	return res
}
