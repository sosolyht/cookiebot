// internal\anti\antiDetectDownload.go

package antidetect

import (
	"archive/zip"
	"context"
	"fmt"
	"go.uber.org/zap"
	"golang.org/x/sys/windows"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"syscall"
)

type ADD struct {
	ctx      context.Context
	logger   *zap.Logger
	progress int
	mu       sync.Mutex
}

func AntiDetectDownload(logger *zap.Logger) *ADD {
	return &ADD{logger: logger}
}

func (a *ADD) DownloadAndInstallAntiDetect() error {
	url := "https://data.hidemyacc.com/HideMyAcc-3-Setup-072024.zip?_gl=1*1uh501u*_gcl_au*MTUxMDE0NjMxMi4xNzIyODI5NTg0*_ga*MTY2Mjg1MzA3LjE3MjI4Mjk1ODQ.*_ga_N9X6D2Y20T*MTcyMjg4OTk5OS4yLjEuMTcyMjg5MTY3MC40OC4wLjA."
	filePath := filepath.Join(os.TempDir(), "HideMyAcc-3-Setup-072024.zip")

	a.logger.Info("Starting A download", zap.String("url", url), zap.String("filePath", filePath))

	// 다운로드
	err := a.downloadFile(filePath, url)
	if err != nil {
		a.logger.Error("Failed to download A", zap.Error(err))
		return err
	}

	// 압축 해제 및 설치
	err = a.extractAndInstallAntiDetect(filePath)
	if err != nil {
		a.logger.Error("Failed to install A", zap.Error(err))
		return err
	}

	a.logger.Info("A download and installation completed successfully")
	return nil
}

func (a *ADD) downloadFile(filePath string, url string) error {
	out, err := os.Create(filePath)
	if err != nil {
		a.logger.Error("Failed to create file for download", zap.String("filePath", filePath), zap.Error(err))
		return err
	}
	defer out.Close()

	resp, err := http.Get(url)
	if err != nil {
		a.logger.Error("Failed to initiate download", zap.String("url", url), zap.Error(err))
		return err
	}
	defer resp.Body.Close()

	totalSize := resp.ContentLength
	downloadedSize := int64(0)
	buf := make([]byte, 32*1024)
	for {
		n, err := resp.Body.Read(buf)
		if n > 0 {
			out.Write(buf[:n])
			downloadedSize += int64(n)
			a.updateProgress(downloadedSize, totalSize)
		}
		if err != nil {
			if err == io.EOF {
				break
			}
			a.logger.Error("Error while downloading file", zap.Error(err))
			return err
		}
	}

	a.logger.Info("Download completed", zap.String("filePath", filePath))
	return nil
}

func (a *ADD) extractAndInstallAntiDetect(zipPath string) error {
	a.logger.Info("Starting to extract A zip file", zap.String("zipPath", zipPath))

	zipReader, err := zip.OpenReader(zipPath)
	if err != nil {
		a.logger.Error("Failed to open zip file", zap.String("zipPath", zipPath), zap.Error(err))
		return err
	}
	defer zipReader.Close()

	extractedPath := filepath.Join(os.TempDir(), "antidetect_extracted")
	if err := os.MkdirAll(extractedPath, 0755); err != nil {
		a.logger.Error("Failed to create extraction directory", zap.String("extractedPath", extractedPath), zap.Error(err))
		return err
	}

	for _, file := range zipReader.File {
		err := a.extractZipFile(file, extractedPath)
		if err != nil {
			a.logger.Error("Failed to extract file", zap.String("file", file.Name), zap.Error(err))
			return err
		}
	}

	a.logger.Info("Extraction completed, searching for installation file", zap.String("extractedPath", extractedPath))

	// 압축 해제된 파일에서 .exe 파일 찾기
	exePath, err := a.findInstallationFile(extractedPath)
	if err != nil {
		a.logger.Error("Failed to find installation file", zap.Error(err))
		return err
	}

	return a.installAntiDetect(exePath)
}

func (a *ADD) extractZipFile(file *zip.File, dest string) error {
	rc, err := file.Open()
	if err != nil {
		a.logger.Error("Failed to open zip entry", zap.String("file", file.Name), zap.Error(err))
		return err
	}
	defer rc.Close()

	path := filepath.Join(dest, file.Name)
	if file.FileInfo().IsDir() {
		os.MkdirAll(path, file.Mode())
	} else {
		os.MkdirAll(filepath.Dir(path), file.Mode())
		outFile, err := os.Create(path)
		if err != nil {
			a.logger.Error("Failed to create file during extraction", zap.String("path", path), zap.Error(err))
			return err
		}
		defer outFile.Close()

		_, err = io.Copy(outFile, rc)
		if err != nil {
			a.logger.Error("Failed to copy file content during extraction", zap.String("path", path), zap.Error(err))
			return err
		}
	}

	a.logger.Info("Extracted file", zap.String("file", file.Name), zap.String("path", path))
	return nil
}

func (a *ADD) findInstallationFile(dir string) (string, error) {
	var exePath string
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			a.logger.Error("Error walking the path", zap.String("path", path), zap.Error(err))
			return err
		}
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".exe") {
			exePath = path
			return filepath.SkipAll
		}
		return nil
	})

	if err != nil {
		a.logger.Error("Error finding installation file", zap.Error(err))
		return "", err
	}

	if exePath == "" {
		a.logger.Error("No .exe file found in directory", zap.String("dir", dir))
		return "", fmt.Errorf("no .exe file found in %s", dir)
	}

	a.logger.Info("Installation file found", zap.String("path", exePath))
	return exePath, nil
}

func (a *ADD) installAntiDetect(filepath string) error {
	a.logger.Info("Starting A installation", zap.String("filepath", filepath))

	// 파일 존재 여부 확인
	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		a.logger.Error("Installation file does not exist", zap.String("filepath", filepath))
		return fmt.Errorf("installation file not found: %s", filepath)
	}

	// RunAs 함수를 사용하여 관리자 권한으로 실행
	err := RunAs(filepath)
	if err != nil {
		a.logger.Error("Error starting A installation with admin privileges", zap.Error(err))
		return err
	}

	a.logger.Info("A installation process started with admin privileges")
	return nil
}

// RunAs launches the specified program with admin privileges.
func RunAs(path string) error {
	verbPtr, _ := syscall.UTF16PtrFromString("runas")
	exePtr, _ := syscall.UTF16PtrFromString(path)
	cwdPtr, _ := syscall.UTF16PtrFromString("")
	argPtr, _ := syscall.UTF16PtrFromString("")

	var showCmd int32 = 1 //SW_NORMAL

	err := windows.ShellExecute(0, verbPtr, exePtr, argPtr, cwdPtr, showCmd)
	if err != nil {
		return err
	}
	return nil
}

func (a *ADD) updateProgress(downloadedSize int64, totalSize int64) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.progress = int(float64(downloadedSize) / float64(totalSize) * 100)
	a.logger.Info("Download progress updated", zap.Int("progress", a.progress))
}

func (a *ADD) GetInstallationProgress() int {
	a.mu.Lock()
	defer a.mu.Unlock()
	return a.progress
}

func (a *ADD) IsAntiDetectInstalled() (bool, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		a.logger.Fatal("Failed to get user home directory", zap.Error(err))
	}
	installPath := filepath.Join(homeDir, "AppData", "Local", "Programs", "hidemyacc-3", "HideMyAcc-3.exe")
	if exists, err := pathExists(installPath); err != nil {
		a.logger.Error("Failed to check A installation path", zap.Error(err))
		return false, err
	} else if !exists {
		a.logger.Info("A is not installed")
		return false, nil
	}

	a.logger.Info("A is installed", zap.String("path", installPath))
	return true, nil
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

func (a *ADD) RunAntiDetect() error {
	// 사용자의 홈 디렉토리 경로를 가져옵니다.
	homeDir, err := os.UserHomeDir()
	if err != nil {
		a.logger.Error("Failed to get user home directory", zap.Error(err))
		return err
	}

	// HideMyAcc-3.exe 파일의 경로를 설정합니다.
	exePath := filepath.Join(homeDir, "AppData", "Local", "Programs", "hidemyacc-3", "HideMyAcc-3.exe")

	// 파일 존재 여부 확인
	if _, err := os.Stat(exePath); os.IsNotExist(err) {
		a.logger.Error("A executable not found", zap.String("path", exePath))
		return fmt.Errorf("A executable not found: %s", exePath)
	}

	cmd := exec.Command(exePath)
	if err := cmd.Start(); err != nil {
		a.logger.Error("Failed to start A", zap.String("path", exePath), zap.Error(err))
		return err
	}

	a.logger.Info("A started successfully", zap.String("path", exePath))
	return nil
}

func (a *ADD) EnsureAntiDetectRunning() error {
	isInstalled, err := a.IsAntiDetectInstalled()
	if err != nil {
		return err
	}

	if isInstalled {
		if !isProcessRunning("HideMyAcc-3.exe") {
			a.logger.Info("A is not running, attempting to start")
			return a.RunAntiDetect()
		}
		a.logger.Info("A is already running")
	} else {
		a.logger.Error("A is not installed")
	}

	return nil
}

func isProcessRunning(name string) bool {
	cmd := exec.Command("tasklist", "/FI", fmt.Sprintf("IMAGENAME eq %s", name))
	output, err := cmd.Output()
	if err != nil {
		return false
	}
	return strings.Contains(string(output), name)
}

func (a *ADD) CheckAndRunAntiDetect() error {
	// 사용자의 홈 디렉토리 경로를 가져옵니다.
	homeDir, err := os.UserHomeDir()
	if err != nil {
		a.logger.Error("Failed to get user home directory", zap.Error(err))
		return err
	}

	// HideMyAcc-3.exe 파일의 경로를 설정합니다.
	exePath := filepath.Join(homeDir, "AppData", "Local", "Programs", "hidemyacc-3", "HideMyAcc-3.exe")

	// 파일이 존재하는지 확인합니다.
	if _, err := os.Stat(exePath); os.IsNotExist(err) {
		a.logger.Error("A executable not found", zap.String("path", exePath))
		return fmt.Errorf("A executable not found: %s", exePath)
	}

	// 프로세스가 실행 중인지 확인합니다.
	if !isProcessRunning("HideMyAcc-3.exe") {
		a.logger.Info("A is not running, attempting to start", zap.String("path", exePath))
		return a.RunAntiDetect()
	}

	a.logger.Info("A is already running")
	return nil
}
