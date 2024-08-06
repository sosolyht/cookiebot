// frontend\src\A.tsx

import React, { useEffect, useState, useMemo } from 'react';
import 'tailwindcss/tailwind.css'; // Tailwind CSS 임포트
import { FaUser, FaShieldAlt, FaEnvelope } from 'react-icons/fa'; // 아이콘 추가

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
    INSTALLED: "Anti-Detect 브라우저가 정상적으로 작동중입니다.",
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
    const statusColor = statusMessage.includes("오류") ? 'text-red-500' :
        statusMessage.includes("정상적으로 작동중입니다") ? 'text-green-500' :
            isInstalling ? 'text-orange-500' :
                downloadComplete ? 'text-green-500' : 'text-red-500';

    return (
        <div className="p-4">
            <div className={`font-bold ${statusColor}`}>
                {statusMessage}
            </div>
        </div>
    );
}

// Menu Component
interface MenuProps {
    items: { icon: JSX.Element; label: string }[];
}

function Menu({ items }: MenuProps) {
    return (
        <div className="flex space-x-4 p-4 bg-gray-100 rounded-lg shadow-md">
            {items.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                    <div className="text-xl">{item.icon}</div>
                    <span className="text-sm mt-2">{item.label}</span>
                </div>
            ))}
        </div>
    );
}

// Main A Component
interface AntiDetectProps {
    isAntiTabActive: boolean;
    onToggleAntiTab: () => void;
}

function A({ isAntiTabActive, onToggleAntiTab }: AntiDetectProps) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isInstalling, setIsInstalling] = useState<boolean>(false);
    const [installationProgress, setInstallationProgress] = useState<number>(0);
    const [downloadComplete, setDownloadComplete] = useState<boolean>(false);
    const [isInstalled, setIsInstalled] = useState<boolean>(false);

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
            setIsInstalled(true);
        } catch (error) {
            console.error("A 상태 확인 중 오류 발생:", error);
            setError("A 상태 확인 중 오류가 발생했습니다: " + (error as Error).message);
            setIsInstalled(false);
        }
    };

    const handleInstallAntiDetect = async () => {
        setIsInstalling(true);
        setError(null);
        try {
            await window.go.antidetect.ADD.DownloadAndInstallAntiDetect();
        } catch (error) {
            console.error("A 설치 중 오류 발생:", error);
            setError(STATUS_MESSAGES.ERROR);
            setIsInstalling(false);
        }
    };

    const statusMessage = useMemo(() => {
        if (error) return error;
        if (isInstalling) return `${STATUS_MESSAGES.INSTALLING} (${installationProgress}%)`;
        if (downloadComplete) return STATUS_MESSAGES.DOWNLOAD_COMPLETE;
        if (isInstalled) return STATUS_MESSAGES.INSTALLED;
        return STATUS_MESSAGES.NOT_INSTALLED;
    }, [error, isInstalling, installationProgress, downloadComplete, isInstalled]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const userInfo = userData && userData.code === 1 ? (
        <p>ID: {userData.data.email} | 만료일: {new Date(userData.data.planExpireDate).toLocaleString()}</p>
    ) : (
        <p>ID: 알 수 없음 | 만료일: 알 수 없음</p>
    );

    const menuItems = [
        { icon: <FaUser />, label: '프로필' },
        { icon: <FaShieldAlt />, label: '프록시' },
        { icon: <FaEnvelope />, label: '이메일' }
    ];

    return (
        <div id="App" className="min-h-screen bg-gray-50 p-4">
            <div className="header mb-4">
                <StatusBar
                    statusMessage={statusMessage}
                    isInstalling={isInstalling}
                    downloadComplete={downloadComplete}
                />
                <div className="user-info text-center mt-2">
                    {userInfo}
                </div>
            </div>
            <Menu items={menuItems} />
            {!isInstalled && !isInstalling && (
                <div className="flex justify-center mt-4">
                    <button onClick={handleInstallAntiDetect} className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition duration-300">
                        Install HideMyAcc-3
                    </button>
                </div>
            )}
            <div className="mt-4 flex items-center">
                <label className="mr-2">Anti-Tab:</label>
                <input
                    type="checkbox"
                    checked={isAntiTabActive}
                    onChange={onToggleAntiTab}
                    className="form-checkbox h-5 w-5 text-blue-600"
                />
            </div>
        </div>
    );
}

export default A;
