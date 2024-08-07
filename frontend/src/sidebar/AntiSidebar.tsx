// frontend\src\sidebar\AntiSidebar.tsx

import React from 'react';
import { Shield, Monitor, Mail, Menu, ShoppingCart } from 'lucide-react';

interface AntiSidebarProps {
    isAntiDetect: boolean;
    setIsAntiDetect: React.Dispatch<React.SetStateAction<boolean>>;
    status: string;
    statusColor: string;
    onMenuChange: (view: 'status' | 'gmail' | 'amazon' | 'other') => void;
    currentView: 'status' | 'gmail' | 'amazon' | 'other';
}

const AntiSidebar: React.FC<AntiSidebarProps> = ({
                                                     isAntiDetect,
                                                     setIsAntiDetect,
                                                     status,
                                                     statusColor,
                                                     onMenuChange,
                                                     currentView
                                                 }) => {
    return (
        <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setIsAntiDetect(prev => !prev)}
                    className={`flex items-center justify-center w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-600 transition-all duration-300 ${
                        isAntiDetect ? 'bg-blue-500' : ''
                    }`}
                >
                    <div className={`absolute w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                        isAntiDetect ? 'translate-x-4' : '-translate-x-4'
                    }`} />
                    <Shield className={`w-4 h-4 absolute left-2 transition-opacity duration-300 ${
                        isAntiDetect ? 'text-white opacity-100' : 'opacity-0'
                    }`} />
                    <Monitor className={`w-4 h-4 absolute right-2 transition-opacity duration-300 ${
                        !isAntiDetect ? 'text-gray-600 opacity-100' : 'opacity-0'
                    }`} />
                </button>
            </div>
            <div className={`text-sm ${statusColor} mb-4`}>
                {status}
            </div>
            <div className="space-y-2">
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
                    onClick={() => onMenuChange('amazon')}
                    className={`flex items-center w-full py-2 px-4 rounded ${currentView === 'amazon' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Amazon 프로필
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

export default AntiSidebar;
