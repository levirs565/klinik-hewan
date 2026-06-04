package core

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

type S3Helper struct {
	Client *s3.Client
	Bucket string
}

func NewS3Helper() (*S3Helper, error) {
	bucket := os.Getenv("S3_BUCKET")
	region := os.Getenv("S3_REGION")
	endpoint := os.Getenv("S3_ENDPOINT")
	accessKey := os.Getenv("S3_ACCESS_KEY_ID")
	secretKey := os.Getenv("S3_SECRET_ACCESS_KEY")

	if bucket == "" || region == "" || accessKey == "" || secretKey == "" {
		return nil, fmt.Errorf("missing S3 configuration (S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY)")
	}

	s3AwsConfig := aws.Config{
		Region:      region,
		Credentials: aws.NewCredentialsCache(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	}

	client := s3.NewFromConfig(s3AwsConfig, func(o *s3.Options) {
		o.BaseEndpoint = &endpoint
		o.UsePathStyle = true
	})

	return &S3Helper{
		Client: client,
		Bucket: bucket,
	}, nil
}

func (s *S3Helper) ConfigureLifecyclePolicy(ctx context.Context) error {
	_, err := s.Client.PutBucketLifecycleConfiguration(ctx, &s3.PutBucketLifecycleConfigurationInput{
		Bucket: aws.String(s.Bucket),
		LifecycleConfiguration: &types.BucketLifecycleConfiguration{
			Rules: []types.LifecycleRule{
				{
					ID:     aws.String("Delete temp files after 1 day"),
					Status: types.ExpirationStatusEnabled,
					Filter: &types.LifecycleRuleFilter{
						Prefix: aws.String("temp/"),
					},
					Expiration: &types.LifecycleExpiration{
						Days: aws.Int32(1),
					},
				},
			},
		},
	})
	return err
}

type PresignedURLResponse struct {
	URL     string            `json:"url"`
	Method  string            `json:"method"`
	Headers map[string]string `json:"headers"`
}

func (s *S3Helper) GeneratePresignedPutURL(ctx context.Context, key string, contentType string, size int64, expiresIn time.Duration) (*PresignedURLResponse, error) {
	presignClient := s3.NewPresignClient(s.Client)

	request, err := presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.Bucket),
		Key:           aws.String(key),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(size),
	}, s3.WithPresignExpires(expiresIn))

	if err != nil {
		return nil, fmt.Errorf("failed to presign put object: %w", err)
	}

	headers := make(map[string]string)
	for k, v := range request.SignedHeader {
		if len(v) > 0 {
			headers[k] = v[0]
		}
	}

	return &PresignedURLResponse{
		URL:     request.URL,
		Method:  request.Method,
		Headers: headers,
	}, nil
}

func (s *S3Helper) GeneratePresignedGetURL(ctx context.Context, key string, expiresIn time.Duration) (string, error) {
	presignClient := s3.NewPresignClient(s.Client)

	request, err := presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.Bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(expiresIn))

	if err != nil {
		return "", fmt.Errorf("failed to presign get object: %w", err)
	}

	return request.URL, nil
}

func (s *S3Helper) GetTempAvatarKey(userID uint, uploadID string) string {
	return fmt.Sprintf("temp/%d/pet_avatar/%s", userID, uploadID)
}

func (s *S3Helper) GetPermanentAvatarKey(petID uint, uploadID string) string {
	return fmt.Sprintf("pets/%d/avatar/%s", petID, uploadID)
}

func (s *S3Helper) GetPetAvatarURL(ctx context.Context, petID uint, avatarID string) string {
	if avatarID == "" {
		return ""
	}
	key := s.GetPermanentAvatarKey(petID, avatarID)
	url, err := s.GeneratePresignedGetURL(ctx, key, 1*time.Hour)
	if err != nil {
		fmt.Printf("warning: failed to generate presigned GET url for pet %d: %v\n", petID, err)
		return ""
	}
	return url
}

func (s *S3Helper) GetPermanentOwnerAvatarKey(ownerID uint, uploadID string) string {
	return fmt.Sprintf("owners/%d/avatar/%s", ownerID, uploadID)
}

func (s *S3Helper) GetOwnerAvatarURL(ctx context.Context, ownerID uint, avatarID string) string {
	if avatarID == "" {
		return ""
	}
	key := s.GetPermanentOwnerAvatarKey(ownerID, avatarID)
	url, err := s.GeneratePresignedGetURL(ctx, key, 1*time.Hour)
	if err != nil {
		fmt.Printf("warning: failed to generate presigned GET url for owner %d: %v\n", ownerID, err)
		return ""
	}
	return url
}

func (s *S3Helper) GetTempStaffAvatarKey(userID uint, uploadID string) string {
	return fmt.Sprintf("temp/staff/avatar/%d/%s", userID, uploadID)
}

func (s *S3Helper) GetPermanentStaffAvatarKey(userID uint, uploadID string) string {
	return fmt.Sprintf("staff/%d/avatar/%s", userID, uploadID)
}

func (s *S3Helper) GetStaffAvatarURL(ctx context.Context, userID uint, avatarID string) string {
	if avatarID == "" {
		return ""
	}
	key := s.GetPermanentStaffAvatarKey(userID, avatarID)
	url, err := s.GeneratePresignedGetURL(ctx, key, 1*time.Hour)
	if err != nil {
		fmt.Printf("warning: failed to generate presigned GET url for staff %d: %v\n", userID, err)
		return ""
	}
	return url
}

func (s *S3Helper) MoveObject(ctx context.Context, sourceKey string, destinationKey string) error {
	copySource := fmt.Sprintf("%s/%s", s.Bucket, sourceKey)

	_, err := s.Client.CopyObject(ctx, &s3.CopyObjectInput{
		Bucket:     aws.String(s.Bucket),
		CopySource: aws.String(copySource),
		Key:        aws.String(destinationKey),
	})
	if err != nil {
		return fmt.Errorf("failed to copy object: %w", err)
	}

	_, err = s.Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.Bucket),
		Key:    aws.String(sourceKey),
	})
	if err != nil {
		fmt.Printf("warning: failed to delete source object %s: %v\n", sourceKey, err)
	}

	return nil
}

func (s *S3Helper) DeleteObject(ctx context.Context, key string) error {
	_, err := s.Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.Bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("failed to delete object: %w", err)
	}
	return nil
}

func (s *S3Helper) FileExists(ctx context.Context, key string) (bool, error) {
	_, err := s.Client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(s.Bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		var nsk *types.NoSuchKey
		var nf *types.NotFound
		if errors.As(err, &nsk) || errors.As(err, &nf) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}
