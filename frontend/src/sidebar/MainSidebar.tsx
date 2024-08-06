import React from 'react';
import { Shield, Monitor, Mail, Menu } from 'lucide-react';

interface MainSidebarProps {
    isAntiDetect: boolean;
    setIsAntiDetect: React.Dispatch<React.SetStateAction<boolean>>;
    status: string;
    statusColor: string;
    onMenuChange: (view: 'status' | 'gmail' | 'other') => void;
    currentView: 'status' | 'gmail' | 'other';
}

const MainSidebar: React.FC<MainSidebarProps> = ({
                                                     isAntiDetect,
                                                     setIsAntiDetect,
                                                     status,
                                                     statusColor,
                                                     onMenuChange,
                                                     currentView
                                                 }) => {
    return (
        <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex flex-col items-center">
            <div className="relative w-16 h-8 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 cursor-pointer"
                 onClick={() => setIsAntiDetect(prev => !prev)}>
                <div className={`absolute w-6 h-6 rounded-full transition-transform duration-300 flex items-center justify-center ${
                    isAntiDetect
                        ? 'bg-blue-500 transform translate-x-0'
                        : 'bg-gray-500 transform translate-x-8'
                }`}>
                    {isAntiDetect ? (
                        <Shield className="w-4 h-4 text-white" />
                    ) : (
                        <Monitor className="w-4 h-4 text-white" />
                    )}
                </div>
            </div>
            <div className={`text-sm ${statusColor} my-4 text-center`}>
                {status}
            </div>
            <div className="space-y-2 w-full">
                <button
                    onClick={() => onMenuChange('status')}
                    className={`flex items-center w-full py-2 px-4 rounded ${currentView === 'status' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                    <Shield className="w-5 h-5 mr-2" />
                    상태
                </button>
                <button
                    onClick={() => onMenuChange('gmail')}
                    className={`flex items-center w-full py-2 px-4 rounded ${currentView === 'gmail' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                    <Mail className="w-5 h-5 mr-2" />
                    Gmail 계정
                </button>
                <button
                    onClick={() => onMenuChange('other')}
                    className={`flex items-center w-full py-2 px-4 rounded ${currentView === 'other' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                    <Menu className="w-5 h-5 mr-2" />
                    기타
                </button>
            </div>
        </div>
    );
};

export default MainSidebar;
