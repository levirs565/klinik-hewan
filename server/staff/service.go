package staff

import (
	"context"
	"errors"
	"vetconnect-server/core"
	"vetconnect-server/models"

	"github.com/samber/lo"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

var (
	ErrUsernameAlreadyExists = errors.New("username already exists")
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

func (s *Service) GetStaffList(ctx context.Context, req GetStaffListRequest) ([]StaffResponse, error) {
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

	return staffList, nil
}

func (s *Service) CreateDoctor(ctx context.Context, req CreateDoctorRequest) (*CreateDoctorResponse, error) {
	// Check if username already exists
	_, err := gorm.G[models.InternalUser](s.db).Where("username = ?", req.Username).First(ctx)
	if err == nil {
		return nil, ErrUsernameAlreadyExists
	}

	hashedPassword, err := core.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := models.InternalUser{
		Username: req.Username,
		Password: hashedPassword,
		FullName: req.FullName,
		Role:     models.RoleDoctor,
		IsActive: req.IsActive,
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		// Create InternalUser
		if err := gorm.G[models.InternalUser](tx).Create(ctx, &user); err != nil {
			return err
		}

		// Create DoctorProfile
		profile := models.DoctorProfile{
			InternalUserID:          user.ID,
			BirthDate:               datatypes.Date(req.BirthDate.Time()),
			EducationHistory:        req.EducationHistory,
			PracticeStartDate:       datatypes.Date(req.PracticeStartDate.Time()),
			JoinDate:                datatypes.Date(req.JoinDate.Time()),
			PracticeLocationHistory: req.PracticeLocationHistory,
		}

		if err := gorm.G[models.DoctorProfile](tx).Create(ctx, &profile); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &CreateDoctorResponse{
		ID:       user.ID,
		Username: user.Username,
		FullName: user.FullName,
	}, nil
}
