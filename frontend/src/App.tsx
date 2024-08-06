// frontend\src\App.tsx

import React, { useState } from 'react';
import Switch from 'react-switch';
import { Shield, Monitor } from 'lucide-react';
import AntiDetectStatus from './AntiDetectStatus';

function App() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isAntiDetect, setIsAntiDetect] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [statusColor, setStatusColor] = useState<string>("");
    const [isInstalling, setIsInstalling] = useState<boolean>(false);
    const [isInstalled, setIsInstalled] = useState<boolean>(false);

    const handleStatusChange = (newStatus: string, newColor: string, installed: boolean) => {
        setStatus(newStatus);
        setStatusColor(newColor);
        setIsInstalled(installed);
        if (newStatus.includes("다운로드 중")) {
            setIsInstalling(true);
        } else {
            setIsInstalling(false);
        }
    };

    const handleInstallAntiDetect = async () => {
        setIsInstalling(true);
        try {
            await window.go.antidetect.ADD.DownloadAndInstallAntiDetect();
        } catch (error) {
            console.error("설치 중 오류 발생:", error);
            setIsInstalling(false);
        }
    };

    return (
        <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
            <div className="w-64 p-4 bg-gray-800 text-white flex flex-col">
                <div className="flex items-center justify-center mb-8">
                    <Switch
                        checked={isAntiDetect}
                        onChange={() => setIsAntiDetect(!isAntiDetect)}
                        offColor="#374151"
                        onColor="#3B82F6"
                        offHandleColor="#ffffff"
                        onHandleColor="#ffffff"
                        height={34}
                        width={70}
                        handleDiameter={30}
                        uncheckedIcon={
                            <div className="flex items-center justify-center h-full mr-2">
                                <Monitor className="w-4 h-4 text-white" />
                            </div>
                        }
                        checkedIcon={
                            <div className="flex items-center justify-center h-full ml-2">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                        }
                        className="react-switch"
                    />
                </div>
                {isAntiDetect && (
                    <div className={`text-sm ${statusColor} mb-4`}>
                        {status}
                    </div>
                )}
                {isAntiDetect && !isInstalling && !isInstalled && (
                    <button onClick={handleInstallAntiDetect} className="bg-blue-500 text-white px-2 py-1 rounded-lg shadow hover:bg-blue-600 transition duration-300">
                        다운로드 및 설치
                    </button>
                )}
            </div>
            <div className="flex-1 p-8">
                {isAntiDetect && <AntiDetectStatus onStatusChange={handleStatusChange} />}
            </div>
        </div>
    );
}

export default App;
