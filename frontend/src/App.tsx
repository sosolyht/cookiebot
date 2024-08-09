// frontend/src/App.tsx

import React, { useState, useEffect } from 'react';
import AntiDetectStatus from './components/AntiDetectStatus';
import MainSidebar from './sidebar/MainSidebar';
import GmailAccount from './pages/GmailAccount';
import AmazonProfile from "./pages/AmazonProfile";
import VM from './pages/VM';
import { Sun, Moon, Download } from 'lucide-react';

function App() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isAntiDetect, setIsAntiDetect] = useState(true);
    const [currentView, setCurrentView] = useState<'status' | 'gmail' | 'amazon' | 'other'>('status');
    const [status, setStatus] = useState<string>("");
    const [statusColor, setStatusColor] = useState<string>("");
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
        if (!isAntiDetect) {
            return <VM />;
        }

        switch (currentView) {
            case 'status':
                return <AntiDetectStatus onStatusChange={handleStatusChange} />;
            case 'gmail':
                return <GmailAccount />;
            case 'amazon':
                return <AmazonProfile />;
            case 'other':
                return <div>Other Content</div>;
            default:
                return <AntiDetectStatus onStatusChange={handleStatusChange} />;
        }
    };

    return (
        <div className={`min-h-screen flex bg-light-bg dark:bg-dark-bg text-text-dark dark:text-text-light transition-colors duration-300`}>
            <MainSidebar
                isAntiDetect={isAntiDetect}
                setIsAntiDetect={setIsAntiDetect}
                status={status}
                statusColor={statusColor}
                onMenuChange={setCurrentView}
                currentView={currentView}
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
