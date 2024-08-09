// frontend/src/sidebar/MainSidebar.tsx

import React from 'react';
import { Mail, Globe, Menu } from 'lucide-react'; // Globe 아이콘으로 변경
import AntiDetectStatus from '../components/AntiDetectStatus';

interface MainSidebarProps {
    onStatusChange: (status: string, color: string, installed: boolean) => void;
    onMenuChange: (view: 'profile' | 'gmail' | 'other') => void;
    currentView: 'profile' | 'gmail' | 'other';
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
                    <Globe className="w-5 h-5 mr-2"/> {/* Globe 아이콘으로 변경 */}
                    브라우저 프로필
                </button>
                <button
                    onClick={() => onMenuChange('gmail')}
                    className={`flex items-center w-full py-2 px-4 rounded text-sm whitespace-nowrap ${currentView === 'gmail' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                    <Mail className="w-5 h-5 mr-2"/>
                    Gmail 계정
                </button>
                <button
                    onClick={() => onMenuChange('other')}
                    className={`flex items-center w-full py-2 px-4 rounded text-sm whitespace-nowrap ${currentView === 'other' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                    <Menu className="w-5 h-5 mr-2"/>
                    기타
                </button>
            </div>
        </div>
    );
};

export default MainSidebar;
