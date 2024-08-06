// main.go

package main

import (
	antidetect "cookieBot/internal/anti"
	"cookieBot/internal/vm"
	"cookieBot/utils"
	"embed"
	"fmt"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
	"go.uber.org/zap"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Zap 로거 초기화
	logger, err := InitializeLogger()
	if err != nil {
		fmt.Printf("Failed to initialize logger: %v\n", err)
		return
	}
	defer logger.Sync() // 버퍼에 남은 로그를 플러시

	// Create an instance of the app structure
	vmMain := vm.VMMain(logger)
	vmDownload := vm.VMDownload(logger)
	antiDownload := antidetect.AntiDetectDownload(logger)

	// 유틸리티 함수 실행
	err = utils.AddComments()
	if err != nil {
		logger.Error("Failed to add comments", zap.Error(err))
	}

	// Create application with options
	err = wails.Run(&options.App{
		Title:  "My Wails Application", // 타이틀바에 제목을 설정합니다
		Width:  1024,
		Height: 768,
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
		},
	})

	if err != nil {
		logger.Error("Failed to run application", zap.Error(err))
	}
}
