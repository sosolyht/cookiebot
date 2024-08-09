import React from 'react';
import { Mail, ShoppingCart, Menu } from 'lucide-react';
import AntiDetectStatus from '../components/AntiDetectStatus';

interface MainSidebarProps {
    onStatusChange: (status: string, color: string, installed: boolean) => void;
    onMenuChange: (view: 'gmail' | 'amazon' | 'other') => void;
    currentView: 'gmail' | 'amazon' | 'other';
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
                    onClick={() => onMenuChange('gmail')}
                    className={`flex items-center w-full py-2 px-4 rounded text-sm whitespace-nowrap ${currentView === 'gmail' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                    <Mail className="w-5 h-5 mr-2"/>
                    Gmail 계정
                </button>
                <button
                    onClick={() => onMenuChange('amazon')}
                    className={`flex items-center w-full py-2 px-4 rounded text-sm whitespace-nowrap ${currentView === 'amazon' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                    <ShoppingCart className="w-5 h-5 mr-2"/>
                    Amazon 프로필
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