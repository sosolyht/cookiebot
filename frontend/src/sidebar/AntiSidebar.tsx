// frontend/src/sidebar/AntiSidebar.tsx

import React from 'react';
import Switch from 'react-switch';
import { Shield, Monitor } from 'lucide-react';

interface AntiSidebarProps {
    isAntiDetect: boolean;
    setIsAntiDetect: (value: boolean) => void;
    status: string;
    statusColor: string;
    isInstalling: boolean;
    isInstalled: boolean;
    handleInstallAntiDetect: () => void;
}

const AntiSidebar: React.FC<AntiSidebarProps> = ({
                                                     isAntiDetect,
                                                     setIsAntiDetect,
                                                     status,
                                                     statusColor,
                                                     isInstalling,
                                                     isInstalled,
                                                     handleInstallAntiDetect
                                                 }) => {
    return (
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
    );
};

export default AntiSidebar;
