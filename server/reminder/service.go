package reminder

import (
	"context"
	"vetconnect-server/core"
	"vetconnect-server/models"

	"github.com/samber/lo"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Service struct {
	db       *gorm.DB
	s3Helper *core.S3Helper
}

func NewService(db *gorm.DB, s3Helper *core.S3Helper) *Service {
	return &Service{
		db:       db,
		s3Helper: s3Helper,
	}
}

func (s *Service) GetMyUnfulfilledReminders(ctx context.Context, ownerID uint) ([]ReminderResponse, error) {
	reminders, err := gorm.G[models.Reminder](s.db).
		Select("reminders.id", "service_type", "reminder_date", "description", "pet_id").
		Joins(clause.JoinTarget{Association: "Pet"}, func(db gorm.JoinBuilder, joinTable, curTable clause.Table) error {
			db.Select("id", "name", "avatar_id", "owner_id")
			return nil
		}).
		Where("`Pet`.owner_id = ?", ownerID).
		Where("reminders.fulfilling_appointment_id IS NULL").
		Order("reminders.reminder_date ASC").
		Find(ctx)

	if err != nil {
		return nil, err
	}

	responses := lo.Map(reminders, func(r models.Reminder, _ int) ReminderResponse {
		return ReminderResponse{
			ID:          r.ID,
			ServiceType: r.ServiceType,
			Date:        core.Date(r.ReminderDate),
			Description: r.Description,
			Pet: PetResponse{
				ID:        r.Pet.ID,
				Name:      r.Pet.Name,
				AvatarURL: s.s3Helper.GetPetAvatarURL(ctx, r.Pet.ID, r.Pet.AvatarID),
			},
		}
	})

	return responses, nil
}
