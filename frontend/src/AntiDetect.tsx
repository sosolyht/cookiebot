// frontend\src\AntiDetect.tsx

import React, { useEffect, useState, useMemo } from 'react';
import './AntiDetect.css';

// Types
interface UserData {
    code: number;
    data: {
        id: string;
        email: string;
        profiles: number;
        plan: string;
        planExpireDate: string;
        coins: number;
    };
}

const STATUS_MESSAGES = {
    INSTALLED: "HideMyAcc-3가 정상적으로 설치되어 있습니다.",
    NOT_INSTALLED: "HideMyAcc-3가 설치되어 있지 않습니다.",
    INSTALLING: "다운로드 중...",
    DOWNLOAD_COMPLETE: "다운로드가 완료되었습니다.",
    ERROR: "오류가 발생했습니다. HideMyAcc-3를 직접 설치해 주세요."
};

// StatusBar Component
interface StatusBarProps {
    statusMessage: string;
    isInstalling: boolean;
    downloadComplete: boolean;
}

function StatusBar({ statusMessage, isInstalling, downloadComplete }: StatusBarProps) {
    const statusColor = statusMessage.includes("오류") ? 'red' :
        isInstalling ? 'orange' :
            downloadComplete ? 'orange' : 'red';

    return (
        <div className="status-container">
            <div className="status-message" style={{ color: statusColor }}>
                {statusMessage}
            </div>
        </div>
    );
}

// Main AntiDetect Component
function AntiDetect() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isInstalling, setIsInstalling] = useState<boolean>(false);
    const [installationProgress, setInstallationProgress] = useState<number>(0);
    const [downloadComplete, setDownloadComplete] = useState<boolean>(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("http://127.0.0.1:2268/me");
                const data = await response.json();
                setUserData(data);
            } catch (err) {
                setError('Failed to load user data.');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

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
                }
            }, 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isInstalling]);

    useEffect(() => {
        let statusCheckInterval: NodeJS.Timeout | null = null;
        if (!downloadComplete) {
            statusCheckInterval = setInterval(async () => {
                await checkAntiDetectStatus();
            }, 4000);
        }
        return () => {
            if (statusCheckInterval) {
                clearInterval(statusCheckInterval);
            }
        };
    }, [downloadComplete]);

    const checkAntiDetectStatus = async () => {
        try {
            const response = await window.go.antidetect.ADD.EnsureAntiDetectRunning();
            console.log("Response from EnsureAntiDetectRunning:", response);
        } catch (error) {
            console.error("AntiDetect 상태 확인 중 오류 발생:", error);
            setError("AntiDetect 상태 확인 중 오류가 발생했습니다: " + (error as Error).message);
        }
    };

    const handleInstallAntiDetect = async () => {
        setIsInstalling(true);
        setError(null);
        try {
            await window.go.antidetect.ADD.DownloadAndInstallAntiDetect();
        } catch (error) {
            console.error("AntiDetect 설치 중 오류 발생:", error);
            setError(STATUS_MESSAGES.ERROR);
            setIsInstalling(false);
        }
    };

    const statusMessage = useMemo(() => {
        if (error) return error;
        if (isInstalling) return `${STATUS_MESSAGES.INSTALLING} (${installationProgress}%)`;
        if (downloadComplete) return STATUS_MESSAGES.DOWNLOAD_COMPLETE;
        return STATUS_MESSAGES.NOT_INSTALLED;
    }, [error, isInstalling, installationProgress, downloadComplete]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div id="App">
            <StatusBar
                statusMessage={statusMessage}
                isInstalling={isInstalling}
                downloadComplete={downloadComplete}
            />
            {userData && userData.code === 1 ? (
                <div>
                    <p>ID: {userData.data.id}</p>
                    <p>Email: {userData.data.email}</p>
                    <p>Profiles: {userData.data.profiles}</p>
                    <p>Plan: {userData.data.plan}</p>
                    <p>Plan Expire Date: {new Date(userData.data.planExpireDate).toLocaleString()}</p>
                    <p>Coins: {userData.data.coins}</p>
                </div>
            ) : (
                <p>Failed to load user data.</p>
            )}
        </div>
    );
}

export default AntiDetect;
