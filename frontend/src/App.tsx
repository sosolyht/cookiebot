// frontend/src/App.tsx

import React, { useState } from 'react';
import AntiDetect from './AntiDetect';
import VM from './VM';
import './App.css';

function App() {
    const [activeTab, setActiveTab] = useState<'AntiDetect' | 'VM'>('AntiDetect');

    const renderContent = () => {
        switch (activeTab) {
            case 'AntiDetect':
                return <AntiDetect />;
            case 'VM':
                return <VM />;
            default:
                return null;
        }
    };

    return (
        <div id="App">
            <nav className="tab-container">
                <div
                    className={`tab-button ${activeTab === 'AntiDetect' ? 'active' : ''}`}
                    onClick={() => setActiveTab('AntiDetect')}
                >
                    AntiDetect
                </div>
                <div
                    className={`tab-button ${activeTab === 'VM' ? 'active' : ''}`}
                    onClick={() => setActiveTab('VM')}
                >
                    VM
                </div>
            </nav>
            <div className="tab-content">
                {renderContent()}
            </div>
        </div>
    );
}

export default App;
