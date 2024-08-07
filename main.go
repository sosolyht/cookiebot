// main.go

package main

import (
	antidetect "cookieBot/internal/anti"
	"cookieBot/internal/db"
	"cookieBot/internal/vm"
	"cookieBot/utils"
	"embed"
	"fmt"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
	"go.uber.org/zap"
	"io/fs"
	"io/ioutil"
	"os"
	"path/filepath"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed config.json
var configFile embed.FS

func main() {
	logger, err := InitializeLogger()
	if err != nil {
		fmt.Printf("Failed to initialize logger: %v\n", err)
		return
	}
	defer logger.Sync()

	// config.json 파일을 임시 디렉토리에 저장
	tempDir, err := ioutil.TempDir("", "config")
	if err != nil {
		logger.Error("Failed to create temp directory", zap.Error(err))
		return
	}
	defer os.RemoveAll(tempDir)

	configPath := filepath.Join(tempDir, "config.json")
	configData, err := fs.ReadFile(configFile, "config.json")
	if err != nil {
		logger.Error("Failed to read embedded config file", zap.Error(err))
		return
	}

	err = ioutil.WriteFile(configPath, configData, 0644)
	if err != nil {
		logger.Error("Failed to write config file to temp directory", zap.Error(err))
		return
	}

	vmMain := vm.VMMain(logger)
	vmDownload := vm.VMDownload(logger)
	antiDownload := antidetect.AntiDetectDownload(logger)

	// EmailDB 초기화
	emailDB, err := db.NewEmailDB(configPath)
	if err != nil {
		logger.Error("Failed to initialize EmailDB", zap.Error(err))
		return
	}

	// 유틸리티 함수 실행
	err = utils.AddComments()
	if err != nil {
		logger.Error("Failed to add comments", zap.Error(err))
	}

	// Create application with options
	err = wails.Run(&options.App{
		Title:  "밀림의제왕",
		Width:  1280,
		Height: 800,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		Windows: &windows.Options{
			BackdropType: windows.Mica,
			Theme:        windows.Dark,
		},
		Bind: []interface{}{
			vmMain,
			vmDownload,
			antiDownload,
			emailDB,
		},
	})

	if err != nil {
		logger.Error("Failed to run application", zap.Error(err))
	}
}
