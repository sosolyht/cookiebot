// internal\vm\vmDownload.go

package vm

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"fmt"
	"go.uber.org/zap"
	"golang.org/x/sys/windows"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"syscall"
)

type VMD struct {
	ctx      context.Context
	logger   *zap.Logger
	progress int
	mu       sync.Mutex
}

func VMDownload(logger *zap.Logger) *VMD {
	return &VMD{logger: logger}
}

func (v *VMD) DownloadAndInstallVMWare() error {
	url := "https://softwareupdate.vmware.com/cds/vmw-desktop/ws/17.5.2/23775571/windows/core/VMware-workstation-17.5.2-23775571.exe.tar"
	filePath := filepath.Join(os.TempDir(), "VMware-workstation-17.5.2-23775571.exe.tar")

	v.logger.Info("Starting VMWare download", zap.String("url", url))

	// 다운로드
	err := v.downloadFile(filePath, url)
	if err != nil {
		v.logger.Error("Failed to download VMWare", zap.Error(err))
		return err
	}

	// 압축 해제 및 설치
	err = v.extractAndInstallVMWare(filePath)
	if err != nil {
		v.logger.Error("Failed to install VMWare", zap.Error(err))
		return err
	}

	v.logger.Info("VMWare download and installation completed successfully")
	return nil
}

func (v *VMD) downloadFile(filePath string, url string) error {
	out, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer out.Close()

	resp, err := http.Get(url)
	if err != nil {
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
			v.updateProgress(downloadedSize, totalSize)
		}
		if err != nil {
			if err == io.EOF {
				break
			}
			return err
		}
	}

	return nil
}

func (v *VMD) extractAndInstallVMWare(tarPath string) error {
	v.logger.Info("Starting to extract VMWare tar file", zap.String("tarPath", tarPath))

	file, err := os.Open(tarPath)
	if err != nil {
		return err
	}
	defer file.Close()

	// gzip 압축 해제 시도
	gzipReader, err := gzip.NewReader(file)
	if err != nil {
		// gzip 압축 해제에 실패했다면 파일 포인터를 처음으로 되돌리고
		// 일반 tar 파일로 처리 시도
		v.logger.Warn("Failed to open as gzip, trying as regular tar", zap.Error(err))
		file.Seek(0, 0)
		return v.extractTar(file)
	}
	defer gzipReader.Close()

	return v.extractTar(gzipReader)
}

func (v *VMD) extractTar(reader io.Reader) error {
	tarReader := tar.NewReader(reader)

	extractedPath := filepath.Join(os.TempDir(), "vmware_extracted")
	if err := os.MkdirAll(extractedPath, 0755); err != nil {
		return err
	}

	for {
		header, err := tarReader.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}

		targetPath := filepath.Join(extractedPath, header.Name)

		switch header.Typeflag {
		case tar.TypeDir:
			if err := os.MkdirAll(targetPath, 0755); err != nil {
				return err
			}
		case tar.TypeReg:
			outFile, err := os.Create(targetPath)
			if err != nil {
				return err
			}
			if _, err := io.Copy(outFile, tarReader); err != nil {
				outFile.Close()
				return err
			}
			outFile.Close()
		default:
			return fmt.Errorf("unknown type: %v in %s", header.Typeflag, header.Name)
		}
	}

	v.logger.Info("Extraction completed, searching for installation file")

	// 압축 해제된 파일에서 .exe 파일 찾기
	exePath, err := v.findInstallationFile(extractedPath)
	if err != nil {
		v.logger.Error("Failed to find installation file", zap.Error(err))
		return err
	}

	return v.installVMWare(exePath)
}

func (v *VMD) findInstallationFile(dir string) (string, error) {
	var exePath string
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".exe") {
			exePath = path
			return filepath.SkipAll
		}
		return nil
	})

	if err != nil {
		return "", err
	}

	if exePath == "" {
		return "", fmt.Errorf("no .exe file found in %s", dir)
	}

	v.logger.Info("Installation file found", zap.String("path", exePath))
	return exePath, nil
}

func (v *VMD) installVMWare(filepath string) error {
	v.logger.Info("Starting VMWare installation", zap.String("filepath", filepath))

	// 파일 존재 여부 확인
	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		v.logger.Error("Installation file does not exist", zap.String("filepath", filepath))
		return fmt.Errorf("installation file not found: %s", filepath)
	}

	// RunAs 함수를 사용하여 관리자 권한으로 실행
	err := RunAs(filepath)
	if err != nil {
		v.logger.Error("Error starting VMWare installation with admin privileges", zap.Error(err))
		return err
	}

	v.logger.Info("VMWare installation process started with admin privileges")
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

func (v *VMD) updateProgress(downloadedSize int64, totalSize int64) {
	v.mu.Lock()
	defer v.mu.Unlock()
	v.progress = int(float64(downloadedSize) / float64(totalSize) * 100)
}

func (v *VMD) GetInstallationProgress() int {
	v.mu.Lock()
	defer v.mu.Unlock()
	return v.progress
}
