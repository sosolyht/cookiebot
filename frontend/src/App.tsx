// frontend/src/App.tsx

import React, { useState, useEffect } from 'react';
import MainSidebar from './sidebar/MainSidebar';
import GmailAccount from './pages/GmailAccount';
import BrowserProfile from "./pages/BrowserProfile";
import { Sun, Moon } from 'lucide-react';

function App() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [currentView, setCurrentView] = useState<'profile' | 'gmail' |  'other'>('profile');
    const [status, setStatus] = useState<string>("연결 안됨");
    const [statusColor, setStatusColor] = useState<string>("red");
    const [isInstalled, setIsInstalled] = useState<boolean>(false);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const handleStatusChange = (newStatus: string, newColor: string, installed: boolean) => {
        setStatus(newStatus);
        setStatusColor(newColor);
        setIsInstalled(installed);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    const renderContent = () => {
        switch (currentView) {
            case 'profile':
                return <BrowserProfile />;
            case 'gmail':
                return <GmailAccount />;
            case 'other':
                return <div>Other Content</div>;
            default:
                return <GmailAccount />;
        }
    };

    return (
        <div className={`min-h-screen flex bg-light-bg dark:bg-dark-bg text-text-dark dark:text-text-light transition-colors duration-300`}>
            <MainSidebar
                onStatusChange={handleStatusChange}
                onMenuChange={setCurrentView}
                currentView={currentView}
                initialStatus={status}
                initialStatusColor={statusColor}
                initialIsInstalled={isInstalled}
            />
            <div className="flex-1 p-8 relative flex items-center justify-center">
                <button
                    onClick={toggleDarkMode}
                    className="absolute top-4 right-4 p-2 rounded-full bg-yellow-400 dark:bg-gray-700 text-gray-800 dark:text-white transition-colors duration-300"
                >
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                {renderContent()}
            </div>
        </div>
    );
}

export default App;
