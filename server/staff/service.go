package staff

import (
	"context"
	"errors"
	"vetconnect-server/core"
	"vetconnect-server/models"

	"github.com/samber/lo"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var (
	ErrUsernameAlreadyExists = errors.New("username already exists")
	ErrDoctorNotFound        = errors.New("doctor not found")
	ErrReceptionistNotFound  = errors.New("receptionist not found")
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
	_, err := gorm.G[models.InternalUser](s.db).
		Select("id").
		Where("username = ?", req.Username).
		First(ctx)
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

func (s *Service) CreateReceptionist(ctx context.Context, req CreateReceptionistRequest) (*CreateReceptionistResponse, error) {
	// Check if username already exists
	_, err := gorm.G[models.InternalUser](s.db).
		Select("id").
		Where("username = ?", req.Username).
		First(ctx)
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
		Role:     models.RoleReceptionist,
		IsActive: req.IsActive,
	}

	if err := gorm.G[models.InternalUser](s.db).Create(ctx, &user); err != nil {
		return nil, err
	}

	return &CreateReceptionistResponse{
		ID:       user.ID,
		Username: user.Username,
		FullName: user.FullName,
	}, nil
}

func (s *Service) GetDoctorDetail(ctx context.Context, id uint) (*DoctorDetailResponse, error) {
	user, err := gorm.G[models.InternalUser](s.db).
		Select("internal_users.id", "username", "full_name", "role", "avatar_id", "is_active").
		Joins(clause.JoinTarget{Association: "DoctorProfile"}, func(db gorm.JoinBuilder, joinTable, curTable clause.Table) error {
			db.Select("birth_date", "education_history", "practice_start_date", "join_date", "practice_location_history")
			return nil
		}).
		Where("internal_users.id = ? AND role = ?", id, models.RoleDoctor).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrDoctorNotFound
		}
		return nil, err
	}

	res := &DoctorDetailResponse{
		ID:        user.ID,
		Username:  user.Username,
		FullName:  user.FullName,
		Role:      user.Role,
		IsActive:  user.IsActive,
		AvatarURL: s.s3.GetStaffAvatarURL(ctx, user.ID, user.AvatarID),
	}

	if user.DoctorProfile != nil {
		res.BirthDate = core.Date(user.DoctorProfile.BirthDate)
		res.EducationHistory = user.DoctorProfile.EducationHistory
		res.PracticeStartDate = core.Date(user.DoctorProfile.PracticeStartDate)
		res.JoinDate = core.Date(user.DoctorProfile.JoinDate)
		res.PracticeLocationHistory = user.DoctorProfile.PracticeLocationHistory
	}

	return res, nil
}

func (s *Service) UpdateDoctor(ctx context.Context, id uint, req UpdateDoctorRequest) (*DoctorDetailResponse, error) {
	user, err := gorm.G[models.InternalUser](s.db).
		Select("id", "username", "full_name", "role", "avatar_id", "is_active").
		Where("id = ? AND role = ?", id, models.RoleDoctor).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrDoctorNotFound
		}
		return nil, err
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		// Update InternalUser
		user.FullName = req.FullName
		user.IsActive = req.IsActive

		query := gorm.G[models.InternalUser](tx).Select("full_name", "is_active")
		if req.Password != "" {
			hashedPassword, err := core.HashPassword(req.Password)
			if err != nil {
				return err
			}
			user.Password = hashedPassword
			query = query.Select("full_name", "is_active", "password")
		}

		if _, err := query.Where("id = ?", id).Updates(ctx, user); err != nil {
			return err
		}

		// Update DoctorProfile
		profile := models.DoctorProfile{
			BirthDate:               datatypes.Date(req.BirthDate.Time()),
			EducationHistory:        req.EducationHistory,
			PracticeStartDate:       datatypes.Date(req.PracticeStartDate.Time()),
			JoinDate:                datatypes.Date(req.JoinDate.Time()),
			PracticeLocationHistory: req.PracticeLocationHistory,
		}

		if _, err := gorm.G[models.DoctorProfile](tx).
			Select("birth_date", "education_history", "practice_start_date", "join_date", "practice_location_history").
			Where("internal_user_id = ?", id).
			Updates(ctx, profile); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return s.GetDoctorDetail(ctx, id)
}

func (s *Service) GetReceptionistDetail(ctx context.Context, id uint) (*ReceptionistDetailResponse, error) {
	user, err := gorm.G[models.InternalUser](s.db).
		Select("id", "username", "full_name", "role", "avatar_id", "is_active").
		Where("id = ? AND role = ?", id, models.RoleReceptionist).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReceptionistNotFound
		}
		return nil, err
	}

	return &ReceptionistDetailResponse{
		ID:        user.ID,
		Username:  user.Username,
		FullName:  user.FullName,
		Role:      user.Role,
		IsActive:  user.IsActive,
		AvatarURL: s.s3.GetStaffAvatarURL(ctx, user.ID, user.AvatarID),
	}, nil
}

func (s *Service) UpdateReceptionist(ctx context.Context, id uint, req UpdateReceptionistRequest) (*ReceptionistDetailResponse, error) {
	user, err := gorm.G[models.InternalUser](s.db).
		Select("id", "username", "full_name", "role", "avatar_id", "is_active").
		Where("id = ? AND role = ?", id, models.RoleReceptionist).
		First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReceptionistNotFound
		}
		return nil, err
	}

	user.FullName = req.FullName
	user.IsActive = req.IsActive

	query := gorm.G[models.InternalUser](s.db).
		Select("full_name", "is_active")

	if req.Password != "" {
		hashedPassword, err := core.HashPassword(req.Password)
		if err != nil {
			return nil, err
		}
		user.Password = hashedPassword
		query = query.Select("full_name", "is_active", "password")
	}

	if _, err := query.Updates(ctx, user); err != nil {
		return nil, err
	}

	return &ReceptionistDetailResponse{
		ID:        user.ID,
		Username:  user.Username,
		FullName:  user.FullName,
		Role:      user.Role,
		IsActive:  user.IsActive,
		AvatarURL: s.s3.GetStaffAvatarURL(ctx, user.ID, user.AvatarID),
	}, nil
}
