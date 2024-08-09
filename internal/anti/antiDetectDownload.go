// internal\anti\antiDetectDownload.go

package antidetect

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"syscall"

	"go.uber.org/zap"
	"golang.org/x/sys/windows"
)

const (
	downloadURL = "https://cdn.undetectable.io/download/Undetectable_x64_win.exe"
	installPath = `C:\Program Files\Undetectable\Undetectable.exe`
	exeFileName = "Undetectable.exe"
)

type ADD struct {
	ctx    context.Context
	logger *zap.Logger
	mu     sync.Mutex
}

func AntiDetectDownload(logger *zap.Logger) *ADD {
	return &ADD{logger: logger}
}

func (a *ADD) IsAntiDetectInstalled() (bool, error) {
	exists, err := pathExists(installPath)
	if err != nil {
		a.logger.Error("Failed to check Undetectable installation path", zap.Error(err))
		return false, err
	}
	a.logger.Info("Undetectable installation status", zap.Bool("installed", exists))
	return exists, nil
}

func (a *ADD) RunAntiDetect() error {
	isInstalled, err := a.IsAntiDetectInstalled()
	if err != nil {
		return fmt.Errorf("설치 여부 확인 중 오류 발생: %w", err)
	}

	if !isInstalled {
		a.logger.Info("Undetectable이 설치되어 있지 않습니다. 다운로드 및 설치를 시작합니다.")
		return a.DownloadAndInstallAntiDetect()
	}

	isRunning, err := a.IsAntiDetectRunning()
	if err != nil {
		return fmt.Errorf("실행 상태 확인 중 오류 발생: %w", err)
	}

	if !isRunning {
		cmd := exec.Command(installPath)
		cmd.SysProcAttr = &syscall.SysProcAttr{
			CreationFlags: windows.CREATE_NEW_PROCESS_GROUP | windows.DETACHED_PROCESS | windows.CREATE_NO_WINDOW,
		}

		if err := cmd.Start(); err != nil {
			a.logger.Error("Failed to start Undetectable", zap.Error(err))
			return err
		}

		a.logger.Info("Undetectable started successfully in background")
	} else {
		a.logger.Info("Undetectable is already running")
	}

	return nil
}

func (a *ADD) IsAntiDetectRunning() (bool, error) {
	cmd := exec.Command("tasklist", "/FI", fmt.Sprintf("IMAGENAME eq %s", exeFileName))
	output, err := cmd.Output()
	if err != nil {
		a.logger.Error("Failed to check if process is running", zap.Error(err))
		return false, err
	}

	isRunning := strings.Contains(string(output), exeFileName)
	a.logger.Info("Checking if Undetectable is running", zap.Bool("isRunning", isRunning))
	return isRunning, nil
}

func pathExists(path string) (bool, error) {
	_, err := os.Stat(path)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}

func (a *ADD) DownloadAndInstallAntiDetect() error {
	tempDir := os.TempDir()
	filePath := filepath.Join(tempDir, exeFileName)

	a.logger.Info("Starting Undetectable download", zap.String("url", downloadURL), zap.String("filePath", filePath))

	if err := a.downloadFile(filePath, downloadURL); err != nil {
		return err
	}

	if err := a.runInstaller(filePath); err != nil {
		return err
	}

	return a.checkInstallation()
}

func (a *ADD) downloadFile(filePath, url string) error {
	out, err := os.Create(filePath)
	if err != nil {
		a.logger.Error("Failed to create file for download", zap.Error(err))
		return err
	}
	defer out.Close()

	resp, err := http.Get(url)
	if err != nil {
		a.logger.Error("Failed to initiate download", zap.Error(err))
		return err
	}
	defer resp.Body.Close()

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		a.logger.Error("Error while downloading file", zap.Error(err))
		return err
	}

	a.logger.Info("Download completed", zap.String("filePath", filePath))
	return nil
}

func (a *ADD) runInstaller(filePath string) error {
	cmd := exec.Command(filePath)
	if err := cmd.Start(); err != nil {
		a.logger.Error("Failed to start Undetectable installer", zap.Error(err))
		return err
	}
	a.logger.Info("Undetectable installer started")
	return nil
}

func (a *ADD) checkInstallation() error {
	if exists, _ := pathExists(installPath); exists {
		a.logger.Info("Undetectable is installed", zap.String("path", installPath))
		return nil
	}
	a.logger.Info("Undetectable installation not detected. Please complete the installation process.")
	return nil
}

func (a *ADD) EnsureAntiDetectRunning() error {
	isInstalled, err := a.IsAntiDetectInstalled()
	if err != nil {
		return err
	}

	if !isInstalled {
		a.logger.Info("Undetectable is not installed, starting download and installation")
		return a.DownloadAndInstallAntiDetect()
	}

	isRunning, err := a.IsAntiDetectRunning()
	if err != nil {
		return err
	}

	if !isRunning {
		a.logger.Info("Undetectable is installed but not running, attempting to start")
		return a.RunAntiDetect()
	}

	a.logger.Info("Undetectable is already running")
	return nil
}

func (a *ADD) ReadConfig(configPath string) (map[string]interface{}, error) {
	configFile, err := os.ReadFile(configPath)
	if err != nil {
		a.logger.Error("Failed to read config file", zap.Error(err))
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var config map[string]interface{}
	err = json.Unmarshal(configFile, &config)
	if err != nil {
		a.logger.Error("Failed to parse config file", zap.Error(err))
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	return config, nil
}

func (a *ADD) GetAntiDetectDownloadURL(config map[string]interface{}) (string, error) {
	antidetectConfig, ok := config["antidetect"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("antidetect configuration not found")
	}

	downloadURL, ok := antidetectConfig["download_url"].(string)
	if !ok {
		return "", fmt.Errorf("antidetect download URL not found in configuration")
	}

	return downloadURL, nil
}

func (a *ADD) GetAntiDetectDestPath(config map[string]interface{}) (string, error) {
	antidetectConfig, ok := config["antidetect"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("antidetect configuration not found")
	}

	destPath, ok := antidetectConfig["dest_path"].(string)
	if !ok {
		return "", fmt.Errorf("antidetect destination path not found in configuration")
	}

	// 사용자 홈 디렉토리 경로로 대체
	if strings.HasPrefix(destPath, "~/") {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return "", fmt.Errorf("failed to get user home directory: %w", err)
		}
		destPath = filepath.Join(homeDir, destPath[2:])
	}

	return destPath, nil
}
