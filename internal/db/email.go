// internal/db/email.go

package db

import (
	"context"
	"fmt"

	awsCfg "cookieBot/internal/config"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type GmailAccount struct {
	Email         string
	Password      string
	RecoveryEmail string
	Used          bool
}

type EmailDB struct {
	client    *dynamodb.Client
	tableName string
}

// NewEmailDB initializes a new EmailDB instance
func NewEmailDB(configFile string) (*EmailDB, error) {
	cfg, err := awsCfg.LoadConfig(configFile)
	if err != nil {
		return nil, fmt.Errorf("unable to load config: %w", err)
	}

	awsCfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(cfg.AWS.Region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.AWS.AccessKeyID, cfg.AWS.SecretAccessKey, "")),
	)
	if err != nil {
		return nil, fmt.Errorf("unable to load AWS SDK config: %w", err)
	}

	client := dynamodb.NewFromConfig(awsCfg)
	return &EmailDB{client: client, tableName: cfg.TableName}, nil
}

// SaveEmail saves a GmailAccount to the DynamoDB table
func (db *EmailDB) SaveEmail(email GmailAccount) error {
	item := map[string]types.AttributeValue{
		"email":          &types.AttributeValueMemberS{Value: email.Email},
		"password":       &types.AttributeValueMemberS{Value: email.Password},
		"recovery_email": &types.AttributeValueMemberS{Value: email.RecoveryEmail},
		"used":           &types.AttributeValueMemberBOOL{Value: email.Used},
	}

	_, err := db.client.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String(db.tableName),
		Item:      item,
	})

	return err
}

// GetEmail retrieves a GmailAccount from the DynamoDB table by email
func (db *EmailDB) GetEmail(email string) (*GmailAccount, error) {
	result, err := db.client.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String(db.tableName),
		Key: map[string]types.AttributeValue{
			"email": &types.AttributeValueMemberS{Value: email},
		},
	})

	if err != nil {
		return nil, err
	}

	if result.Item == nil {
		return nil, fmt.Errorf("could not find email with address %s", email)
	}

	account := &GmailAccount{
		Email:         result.Item["email"].(*types.AttributeValueMemberS).Value,
		Password:      result.Item["password"].(*types.AttributeValueMemberS).Value,
		RecoveryEmail: result.Item["recovery_email"].(*types.AttributeValueMemberS).Value,
		Used:          result.Item["used"].(*types.AttributeValueMemberBOOL).Value,
	}

	return account, nil
}

// ListEmails lists all GmailAccounts from the DynamoDB table
func (db *EmailDB) ListEmails() ([]GmailAccount, error) {
	input := &dynamodb.ScanInput{
		TableName: aws.String(db.tableName),
	}

	result, err := db.client.Scan(context.TODO(), input)
	if err != nil {
		return nil, err
	}

	var accounts []GmailAccount
	for _, item := range result.Items {
		account := GmailAccount{
			Email:         item["email"].(*types.AttributeValueMemberS).Value,
			Password:      item["password"].(*types.AttributeValueMemberS).Value,
			RecoveryEmail: item["recovery_email"].(*types.AttributeValueMemberS).Value,
			Used:          item["used"].(*types.AttributeValueMemberBOOL).Value,
		}
		accounts = append(accounts, account)
	}

	return accounts, nil
}

// DeleteEmail deletes a GmailAccount from the DynamoDB table by email
func (db *EmailDB) DeleteEmail(email string) error {
	_, err := db.client.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
		TableName: aws.String(db.tableName),
		Key: map[string]types.AttributeValue{
			"email": &types.AttributeValueMemberS{Value: email},
		},
	})

	return err
}
