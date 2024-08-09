// internal/browser/request.go

package browser

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"go.uber.org/zap"
)

const BASE_URL = "http://localhost:25325"

// BrowserManager 구조체 정의
type BrowserManager struct {
	ctx    context.Context
	logger *zap.Logger
	mu     sync.Mutex
}

// NewBrowserManager 함수 정의
func NewBrowserManager(ctx context.Context, logger *zap.Logger) *BrowserManager {
	return &BrowserManager{
		ctx:    ctx,
		logger: logger,
	}
}

// Profile 구조체 정의
type Profile struct {
	Name          string   `json:"name"`
	Status        string   `json:"status"`
	DebugPort     string   `json:"debug_port"`
	WebsocketLink string   `json:"websocket_link"`
	Folder        string   `json:"folder"`
	Tags          []string `json:"tags"`
	CloudID       string   `json:"cloud_id"`
	CreationDate  int64    `json:"creation_date"`
	ModifyDate    int64    `json:"modify_date"`
}

// ProfileResponse 구조체 정의
type ProfileResponse struct {
	Code   int                `json:"code"`
	Status string             `json:"status"`
	Data   map[string]Profile `json:"data"`
}

// Cookie 구조체 정의
type Cookie struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

// Account 구조체 정의
type Account struct {
	Website  string `json:"website"`
	Username string `json:"username"`
	Password string `json:"password"`
}

// CreateProfileRequest 구조체 수정
type CreateProfileRequest struct {
	Name        string    `json:"name"`
	OS          string    `json:"os"`
	Browser     string    `json:"browser"`
	CPU         int       `json:"cpu"`
	Memory      int       `json:"memory"`
	Tags        []string  `json:"tags"`
	Geolocation string    `json:"geolocation"`
	Resolution  string    `json:"resolution"`
	Proxy       string    `json:"proxy"`
	Notes       string    `json:"notes"`
	Folder      string    `json:"folder"`
	Language    string    `json:"language"`
	Cookies     []Cookie  `json:"cookies"`  // 변경된 부분
	Accounts    []Account `json:"accounts"` // 변경된 부분
	Type        string    `json:"type"`
	Group       string    `json:"group"`
	ConfigID    string    `json:"configid"`
	Timezone    string    `json:"timezone"`
}

// FetchProfiles 메서드 정의
func (bm *BrowserManager) FetchProfiles() (*ProfileResponse, error) {
	bm.logger.Info("Fetching profiles from the server")
	resp, err := http.Get(fmt.Sprintf("%s/list", BASE_URL))
	if err != nil {
		bm.logger.Error("Failed to fetch profiles", zap.Error(err))
		return nil, err
	}
	defer resp.Body.Close()

	var profileResponse ProfileResponse
	if err := json.NewDecoder(resp.Body).Decode(&profileResponse); err != nil {
		bm.logger.Error("Failed to decode profile response", zap.Error(err))
		return nil, err
	}
	bm.logger.Info("Successfully fetched profiles", zap.Int("count", len(profileResponse.Data)))
	return &profileResponse, nil
}

// AddProfile 메서드 정의
func (bm *BrowserManager) AddProfile(req CreateProfileRequest) (map[string]interface{}, error) {
	bm.logger.Info("Creating new profile", zap.String("name", req.Name))
	jsonData, err := json.Marshal(req)
	if err != nil {
		bm.logger.Error("Failed to marshal create profile request", zap.Error(err))
		return nil, err
	}

	resp, err := http.Post(fmt.Sprintf("%s/profile/create", BASE_URL), "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		bm.logger.Error("Failed to create profile", zap.Error(err))
		return nil, err
	}
	defer resp.Body.Close()

	var response map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		bm.logger.Error("Failed to decode create profile response", zap.Error(err))
		return nil, err
	}
	bm.logger.Info("Successfully created profile", zap.String("profileID", response["profile_id"].(string)))
	return response, nil
}

// LaunchProfile 메서드 정의
func (bm *BrowserManager) LaunchProfile(profileID string) (map[string]interface{}, error) {
	bm.logger.Info("Launching profile", zap.String("profileID", profileID))
	resp, err := http.Get(fmt.Sprintf("%s/profile/start/%s", BASE_URL, profileID))
	if err != nil {
		bm.logger.Error("Failed to launch profile", zap.String("profileID", profileID), zap.Error(err))
		return nil, err
	}
	defer resp.Body.Close()

	var response map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		bm.logger.Error("Failed to decode launch profile response", zap.Error(err))
		return nil, err
	}
	bm.logger.Info("Successfully launched profile", zap.String("profileID", profileID))
	return response, nil
}

// TerminateProfile 메서드 정의
func (bm *BrowserManager) TerminateProfile(profileID string) (map[string]interface{}, error) {
	bm.logger.Info("Terminating profile", zap.String("profileID", profileID))
	resp, err := http.Get(fmt.Sprintf("%s/profile/stop/%s", BASE_URL, profileID))
	if err != nil {
		bm.logger.Error("Failed to terminate profile", zap.String("profileID", profileID), zap.Error(err))
		return nil, err
	}
	defer resp.Body.Close()

	var response map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		bm.logger.Error("Failed to decode terminate profile response", zap.Error(err))
		return nil, err
	}
	bm.logger.Info("Successfully terminated profile", zap.String("profileID", profileID))
	return response, nil
}

// ModifyProfile 메서드 정의
func (bm *BrowserManager) ModifyProfile(profileID string, req CreateProfileRequest) (map[string]interface{}, error) {
	bm.logger.Info("Modifying profile", zap.String("profileID", profileID))
	jsonData, err := json.Marshal(req)
	if err != nil {
		bm.logger.Error("Failed to marshal modify profile request", zap.Error(err))
		return nil, err
	}

	client := &http.Client{}
	reqUpdate, err := http.NewRequest("POST", fmt.Sprintf("%s/profile/update/%s", BASE_URL, profileID), bytes.NewBuffer(jsonData))
	if err != nil {
		bm.logger.Error("Failed to create modify profile request", zap.Error(err))
		return nil, err
	}
	reqUpdate.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(reqUpdate)
	if err != nil {
		bm.logger.Error("Failed to modify profile", zap.String("profileID", profileID), zap.Error(err))
		return nil, err
	}
	defer resp.Body.Close()

	var response map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		bm.logger.Error("Failed to decode modify profile response", zap.Error(err))
		return nil, err
	}
	bm.logger.Info("Successfully modified profile", zap.String("profileID", profileID))
	return response, nil
}

// RemoveProfile 메서드 정의
func (bm *BrowserManager) RemoveProfile(profileID string) (map[string]interface{}, error) {
	bm.logger.Info("Removing profile", zap.String("profileID", profileID))
	resp, err := http.Get(fmt.Sprintf("%s/profile/delete/%s", BASE_URL, profileID))
	if err != nil {
		bm.logger.Error("Failed to remove profile", zap.String("profileID", profileID), zap.Error(err))
		return nil, err
	}
	defer resp.Body.Close()

	var response map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		bm.logger.Error("Failed to decode remove profile response", zap.Error(err))
		return nil, err
	}
	bm.logger.Info("Successfully removed profile", zap.String("profileID", profileID))
	return response, nil
}
