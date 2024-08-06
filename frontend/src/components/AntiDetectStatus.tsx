// frontend/src/AntiDetectStatus.tsx

import { useEffect, useState, useMemo } from 'react';

// 상태 메시지와 색상 정의
const STATUS_MESSAGES = {
    INSTALLED: "안티브라우저가 정상적으로 작동중입니다.",
    NOT_INSTALLED: "안티브라우저가 설치되어 있지 않습니다.",
    INSTALLING: "다운로드 중...",
    DOWNLOAD_COMPLETE: "다운로드가 완료되었습니다.",
    ERROR: "안티브라우저를 직접 설치해 주세요."
};

const STATUS_COLORS = {
    INSTALLED: "text-green-500",
    NOT_INSTALLED: "text-red-500",
    INSTALLING: "text-orange-500",
    DOWNLOAD_COMPLETE: "text-green-500",
    ERROR: "text-red-500"
};

interface AntiDetectStatusProps {
    onStatusChange: (status: string, color: string, isInstalled: boolean) => void;
}

function AntiDetectStatus({ onStatusChange }: AntiDetectStatusProps) {
    // 상태 관리
    const [error, setError] = useState<string | null>(null);
    const [isInstalling, setIsInstalling] = useState<boolean>(false);
    const [installationProgress, setInstallationProgress] = useState<number>(0);
    const [downloadComplete, setDownloadComplete] = useState<boolean>(false);
    const [isInstalled, setIsInstalled] = useState<boolean>(false);

    // 설치 진행 상태 확인
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isInstalling) {
            interval = setInterval(async () => {
                const progress = await window.go.antidetect.ADD.GetInstallationProgress();
                setInstallationProgress(progress);
                if (progress >= 100) {
                    clearInterval(interval!);
                    setIsInstalling(false);
                    setDownloadComplete(true);
                    setIsInstalled(true);
                }
            }, 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isInstalling]);

    // AntiDetect 상태 확인
    useEffect(() => {
        let statusCheckInterval: NodeJS.Timeout | null = null;
        if (!downloadComplete) {
            statusCheckInterval = setInterval(checkAntiDetectStatus, 4000);
        }
        return () => {
            if (statusCheckInterval) {
                clearInterval(statusCheckInterval);
            }
        };
    }, [downloadComplete]);

    // AntiDetect 상태 확인 함수
    const checkAntiDetectStatus = async () => {
        try {
            const response = await window.go.antidetect.ADD.EnsureAntiDetectRunning();
            console.log("Response from EnsureAntiDetectRunning:", response);
            setIsInstalled(true);
        } catch (error) {
            console.error("AntiDetect 상태 확인 중 오류 발생:", error);
            setError("AntiDetect 상태 확인 중 오류가 발생했습니다: " + (error as Error).message);
            setIsInstalled(false);
        }
    };

    // 상태 메시지 및 색상 결정
    const statusMessage = useMemo(() => {
        if (error) return error;
        if (isInstalling) return `${STATUS_MESSAGES.INSTALLING} (${installationProgress}%)`;
        if (downloadComplete) return STATUS_MESSAGES.DOWNLOAD_COMPLETE;
        if (isInstalled) return STATUS_MESSAGES.INSTALLED;
        return STATUS_MESSAGES.NOT_INSTALLED;
    }, [error, isInstalling, installationProgress, downloadComplete, isInstalled]);

    const statusColor = useMemo(() => {
        if (error) return STATUS_COLORS.ERROR;
        if (isInstalling) return STATUS_COLORS.INSTALLING;
        if (downloadComplete) return STATUS_COLORS.DOWNLOAD_COMPLETE;
        if (isInstalled) return STATUS_COLORS.INSTALLED;
        return STATUS_COLORS.NOT_INSTALLED;
    }, [error, isInstalling, downloadComplete, isInstalled]);

    // 상태 변경 시 부모 컴포넌트에 알림
    useEffect(() => {
        onStatusChange(statusMessage, statusColor, isInstalled);
    }, [statusMessage, statusColor, isInstalled, onStatusChange]);

    return null; // UI 요소가 없으므로 null 반환
}

export default AntiDetectStatus;
export { STATUS_MESSAGES, STATUS_COLORS };
