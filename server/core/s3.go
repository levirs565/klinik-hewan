package core

import (
	"context"
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

func (s *S3Helper) GeneratePresignedPutURL(ctx context.Context, key string, contentType string, expiresIn time.Duration) (*PresignedURLResponse, error) {
	presignClient := s3.NewPresignClient(s.Client)

	request, err := presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.Bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
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
