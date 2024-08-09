// frontend\src\components\AntiDetectStatus.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Download, CheckCircle, AlertCircle, Play } from 'lucide-react';

interface AntiDetectStatusProps {
    onStatusChange: (status: string, color: string, installed: boolean) => void;
}

const AntiDetectStatus: React.FC<AntiDetectStatusProps> = ({ onStatusChange }) => {
    const [isInstalled, setIsInstalled] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [installProgress, setInstallProgress] = useState(0);
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        checkInstallation();
        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
        };
    }, []);

    const checkInstallation = async () => {
        try {
            const installed = await window.go.antidetect.ADD.IsAntiDetectInstalled();
            setIsInstalled(installed);
            if (installed) {
                onStatusChange('설치됨', 'green', true);
                startCheckingAndRunning();
            } else {
                onStatusChange('설치 필요', 'red', false);
            }
        } catch (error) {
            console.error("설치 상태 확인 중 오류 발생:", error);
            onStatusChange('오류 발생', 'red', false);
        }
    };

    const startCheckingAndRunning = () => {
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
        }
        checkIntervalRef.current = setInterval(checkAndRunAntiDetect, 5000); // 5초마다 확인
    };

    const checkAndRunAntiDetect = async () => {
        try {
            const installed = await window.go.antidetect.ADD.IsAntiDetectInstalled();
            if (installed) {
                await window.go.antidetect.ADD.EnsureAntiDetectRunning();
                // EnsureAntiDetectRunning이 성공적으로 실행되면 AntiDetect가 실행 중이라고 가정합니다.
                setIsRunning(true);
                onStatusChange('실행 중', 'blue', true);
                console.log("AntiDetect가 실행 중입니다.");
            } else {
                setIsRunning(false);
                onStatusChange('설치 필요', 'red', false);
                if (checkIntervalRef.current) {
                    clearInterval(checkIntervalRef.current);
                }
            }
        } catch (error) {
            console.error("AntiDetect 확인 및 실행 중 오류 발생:", error);
            setIsRunning(false);
            onStatusChange('오류 발생', 'red', true);
        }
    };




    const startInstallation = async () => {
        try {
            setIsInstalling(true);
            onStatusChange('설치 시작 중...', 'blue', false);
            await window.go.antidetect.ADD.DownloadAndInstallAntiDetect();
            updateInstallProgress();
        } catch (error) {
            console.error("설치 시작 중 오류 발생:", error);
            setIsInstalling(false);
            onStatusChange('설치 오류', 'red', false);
        }
    };

    const updateInstallProgress = async () => {
        try {
            const progress = await window.go.antidetect.ADD.GetInstallationProgress();
            console.log(`Current progress: ${progress}`);
            setInstallProgress(progress);
            onStatusChange(`설치 중... ${progress.toFixed(2)}%`, 'blue', false);
            if (progress < 100) {
                setTimeout(updateInstallProgress, 1000);
            } else {
                setIsInstalling(false);
                setTimeout(() => {
                    checkInstallation();
                    startCheckingAndRunning();
                }, 5000); // 설치 완료 후 5초 후에 설치 상태 확인 및 실행 상태 확인 시작
            }
        } catch (error) {
            console.error("진행 상황 확인 중 오류 발생:", error);
        }
    };

    const handleRun = async () => {
        try {
            await window.go.antidetect.ADD.RunAntiDetect();
            setIsRunning(true);
            onStatusChange('실행 중', 'blue', true);
        } catch (error) {
            console.error("AntiDetect 실행 중 오류 발생:", error);
        }
    };

    return (
        <div className="space-y-4">
            {isInstalled ? (
                <div className="flex items-center space-x-2 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                    <span>AntiDetect 설치됨</span>
                </div>
            ) : (
                <div className="flex items-center space-x-2 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <span>AntiDetect 설치 필요</span>
                </div>
            )}

            {!isInstalled && !isInstalling && (
                <button
                    onClick={startInstallation}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                    <Download className="w-5 h-5" />
                    <span>다운로드 및 설치</span>
                </button>
            )}

            {isInstalling && (
                <div className="space-y-2">
                    <div>설치 중... {installProgress.toFixed(2)}%</div>
                    <div className="w-full bg-gray-200 h-2.5 dark:bg-gray-700">
                        <div
                            className="bg-blue-600 h-2.5"
                            style={{ width: `${installProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {isInstalled && !isInstalling && !isRunning && (
                <button
                    onClick={handleRun}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                    <Play className="w-5 h-5" />
                    <span>AntiDetect 실행</span>
                </button>
            )}

            {isRunning && (
                <div className="flex items-center space-x-2 text-blue-500">
                    <CheckCircle className="w-5 h-5" />
                    <span>AntiDetect 실행 중</span>
                </div>
            )}
        </div>
    );
};

export default AntiDetectStatus;
