// internal/config/config.go

package config

import (
	"encoding/json"
	"fmt"
	"os"
)

type Config struct {
	AWS struct {
		Region          string `json:"Region"`
		AccessKeyID     string `json:"AccessKeyID"`
		SecretAccessKey string `json:"SecretAccessKey"`
	} `json:"AWS"`
	TableName string `json:"TableName"`
}

func LoadConfig(configFile string) (*Config, error) {
	file, err := os.Open(configFile)
	if err != nil {
		return nil, fmt.Errorf("unable to open config file: %w", err)
	}
	defer file.Close()

	config := &Config{}
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(config); err != nil {
		return nil, fmt.Errorf("unable to decode config file: %w", err)
	}

	return config, nil
}
