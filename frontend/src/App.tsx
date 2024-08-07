// frontend\src\App.tsx

import React, { useState, useEffect } from 'react';
import AntiDetectStatus from './components/AntiDetectStatus';
import MainSidebar from './sidebar/MainSidebar';
import VMSidebar from './sidebar/VMSidebar';
import GmailAccount from './pages/GmailAccount';
import AmazonProfile from "./pages/AmazonProfile";
import VM from './pages/VM';
import { Sun, Moon } from 'lucide-react';

function App() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isAntiDetect, setIsAntiDetect] = useState(true);
    const [currentView, setCurrentView] = useState<'status' | 'gmail' | 'amazon' | 'other'>('status');
    const [status, setStatus] = useState<string>("");
    const [statusColor, setStatusColor] = useState<string>("");

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const handleStatusChange = (newStatus: string, newColor: string) => {
        setStatus(newStatus);
        setStatusColor(newColor);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
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
            <div className="flex-1 p-8 relative">
                <button
                    onClick={toggleDarkMode}
                    className="absolute top-4 right-4 p-2 rounded-full bg-yellow-400 dark:bg-gray-700 text-gray-800 dark:text-white transition-colors duration-300"
                >
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                {isAntiDetect ? (
                    <>
                        <AntiDetectStatus onStatusChange={handleStatusChange} />
                        {currentView === 'gmail' && <GmailAccount />}
                        {currentView === 'amazon' && <AmazonProfile />}
                        {currentView === 'other' && <div>Other Component</div>}
                    </>
                ) : (
                    <VM />
                )}
            </div>
        </div>
    );
}

export default App;
