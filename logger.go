// logger.go

package main

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"os"
	"path/filepath"
)

// InitializeLogger initializes and returns a Zap logger with colorized console output and file output.
func InitializeLogger() (*zap.Logger, error) {
	// 콘솔 출력용 인코더 설정
	consoleEncoder := zapcore.NewConsoleEncoder(encoderConfig())

	// 파일 출력용 인코더 설정
	fileEncoder := zapcore.NewJSONEncoder(encoderConfig())

	// 로그 레벨 설정
	atomicLevel := zap.NewAtomicLevel()
	atomicLevel.SetLevel(zap.DebugLevel)

	// 콘솔 출력 설정
	consoleOutput := zapcore.Lock(os.Stdout)

	// 실행 파일의 디렉토리 경로 가져오기
	executablePath, err := os.Executable()
	if err != nil {
		return nil, err
	}
	executableDir := filepath.Dir(executablePath)

	// 로그 파일 경로 설정
	logFilePath := filepath.Join(executableDir, "app.log")
	logFile, err := os.OpenFile(logFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return nil, err
	}
	fileOutput := zapcore.AddSync(logFile)

	// 코어 설정 (콘솔 + 파일)
	core := zapcore.NewTee(
		zapcore.NewCore(consoleEncoder, consoleOutput, atomicLevel),
		zapcore.NewCore(fileEncoder, fileOutput, atomicLevel),
	)

	// 로거 생성
	logger := zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))

	return logger, nil
}

// encoderConfig returns a Zap encoder configuration with colorized output.
func encoderConfig() zapcore.EncoderConfig {
	return zapcore.EncoderConfig{
		TimeKey:        "T",
		LevelKey:       "L",
		NameKey:        "N",
		CallerKey:      "C",
		MessageKey:     "M",
		StacktraceKey:  "S",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.CapitalColorLevelEncoder, // 대문자 레벨 인코딩 (색상)
		EncodeTime:     zapcore.ISO8601TimeEncoder,       // ISO8601 시간 인코딩
		EncodeDuration: zapcore.StringDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
	}
}
