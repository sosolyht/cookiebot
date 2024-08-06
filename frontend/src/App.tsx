// frontend/src/App.tsx

import React, { useState } from 'react';
import AntiDetectStatus from './components/AntiDetectStatus';
import AntiSidebar from './sidebar/AntiSidebar';

function App() {
    // 상태 관리
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isAntiDetect, setIsAntiDetect] = useState(true); // 기본값을 true로 설정
    const [status, setStatus] = useState<string>("");
    const [statusColor, setStatusColor] = useState<string>("");
    const [isInstalling, setIsInstalling] = useState<boolean>(false);
    const [isInstalled, setIsInstalled] = useState<boolean>(false);

    // 상태 변경 핸들러
    const handleStatusChange = (newStatus: string, newColor: string, installed: boolean) => {
        setStatus(newStatus);
        setStatusColor(newColor);
        setIsInstalled(installed);
        setIsInstalling(newStatus.includes("다운로드 중"));
    };

    // AntiDetect 설치 핸들러
    const handleInstallAntiDetect = async () => {
        setIsInstalling(true);
        try {
            await window.go.antidetect.ADD.DownloadAndInstallAntiDetect();
        } catch (error) {
            console.error("설치 중 오류 발생:", error);
        } finally {
            setIsInstalling(false);
        }
    };

    return (
        <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
            <AntiSidebar
                isAntiDetect={isAntiDetect}
                setIsAntiDetect={setIsAntiDetect}
                status={status}
                statusColor={statusColor}
                isInstalling={isInstalling}
                isInstalled={isInstalled}
                handleInstallAntiDetect={handleInstallAntiDetect}
            />
            <div className="flex-1 p-8">
                {isAntiDetect && <AntiDetectStatus onStatusChange={handleStatusChange} />}
            </div>
        </div>
    );
}

export default App;
