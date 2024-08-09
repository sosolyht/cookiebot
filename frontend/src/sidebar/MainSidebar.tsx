// frontend/src/sidebar/MainSidebar.tsx

import React from 'react';
import { Mail, Globe, Menu } from 'lucide-react';
import AntiDetectStatus from '../components/AntiDetectStatus';

interface MainSidebarProps {
    onStatusChange: (status: string, color: string, installed: boolean) => void;
    onMenuChange: (view: 'profile' | 'gmail') => void;
    currentView: 'profile' | 'gmail';
    initialStatus: string;
    initialStatusColor: string;
    initialIsInstalled: boolean;
}

const MainSidebar: React.FC<MainSidebarProps> = ({
                                                     onStatusChange,
                                                     onMenuChange,
                                                     currentView,
                                                     initialStatus,
                                                     initialStatusColor,
                                                     initialIsInstalled
                                                 }) => {
    return (
        <div className="w-full sm:w-64 bg-gray-100 dark:bg-gray-800 p-4 flex flex-col h-screen">
            <div className="mb-6 flex justify-center">
                <div className="w-full">
                    <AntiDetectStatus
                        onStatusChange={onStatusChange}
                        initialStatus={initialStatus}
                        initialStatusColor={initialStatusColor}
                        initialIsInstalled={initialIsInstalled}
                    />
                </div>
            </div>
            <div className="space-y-4 flex-grow">
                <button
                    onClick={() => onMenuChange('profile')}
                    className={`flex items-center w-full py-2 px-4 rounded text-sm whitespace-nowrap ${currentView === 'profile' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                    <Globe className="w-5 h-5 mr-2"/>
                    브라우저 프로필
                </button>
                <button
                    onClick={() => onMenuChange('gmail')}
                    className={`flex items-center w-full py-2 px-4 rounded text-sm whitespace-nowrap ${currentView === 'gmail' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                    <Mail className="w-5 h-5 mr-2"/>
                    Gmail 계정
                </button>
            </div>
        </div>
    );
};

export default MainSidebar;
