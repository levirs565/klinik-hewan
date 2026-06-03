package staff

import (
	"context"
	"vetconnect-server/core"
	"vetconnect-server/models"

	"github.com/samber/lo"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
	s3 *core.S3Helper
}

func NewService(db *gorm.DB, s3 *core.S3Helper) *Service {
	return &Service{
		db: db,
		s3: s3,
	}
}

func (s *Service) GetStaffList(ctx context.Context, req GetStaffListRequest) (*GetStaffListResponse, error) {
	var roles []models.AccountRole
	if req.Role != "" {
		roles = []models.AccountRole{req.Role}
	} else {
		roles = []models.AccountRole{models.RoleDoctor, models.RoleReceptionist}
	}

	query := gorm.G[models.InternalUser](s.db).
		Select("id", "full_name", "role", "avatar_id").
		Where("role IN ?", roles)

	if req.Limit > 0 {
		query = query.Limit(req.Limit)
	}

	users, err := query.Find(ctx)
	if err != nil {
		return nil, err
	}

	staffList := lo.Map(users, func(user models.InternalUser, _ int) StaffResponse {
		return StaffResponse{
			ID:        user.ID,
			FullName:  user.FullName,
			Role:      user.Role,
			AvatarURL: s.s3.GetStaffAvatarURL(ctx, user.ID, user.AvatarID),
		}
	})

	return &GetStaffListResponse{
		Data: staffList,
	}, nil
}
