// frontend/src/pages/AmazonProfile.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface AmazonProfile {
    id: string;
    name: string;
    os: string;
    notes: string;
    browserSource: string;
    browserType: string;
    proxy: {
        proxyEnabled: boolean;
        autoProxyServer: string;
        autoProxyUsername: string;
        autoProxyPassword: string;
        mode: string;
        port: number;
        autoProxyRegion: string;
        torProxyRegion: string;
        host: string;
        username: string;
        password: string;
    };
    updatedAt: string;
    status: string;
}

const AmazonProfile: React.FC = () => {
    const [profiles, setProfiles] = useState<AmazonProfile[]>([]);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:2268/profiles');
            window.runtime.LogInfo(response.data)
            if (response.data.code === 1) {
                window.runtime.LogInfo(response.data)
                setProfiles(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch Amazon profiles:", error);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Amazon Profiles</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                    <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                        <th className="py-2 px-2 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">Name</th>
                        <th className="py-2 px-2 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">OS</th>
                        <th className="py-2 px-2 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">Browser</th>
                        <th className="py-2 px-2 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">Proxy</th>
                        <th className="py-2 px-2 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">Status</th>
                        <th className="py-2 px-2 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">Last Updated</th>
                    </tr>
                    </thead>
                    <tbody>
                    {profiles.map((profile) => (
                        <tr key={profile.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="py-2 px-2 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-center">{profile.name}</td>
                            <td className="py-2 px-2 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-center">{profile.os}</td>
                            <td className="py-2 px-2 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-center">{`${profile.browserSource} (${profile.browserType})`}</td>
                            <td className="py-2 px-2 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-center">
                                {profile.proxy.proxyEnabled ? 'Enabled' : 'Disabled'}
                            </td>
                            <td className="py-2 px-2 border-b border-gray-200 dark:border-gray-700 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                        profile.status === 'ready' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                                    }`}>
                                        {profile.status}
                                    </span>
                            </td>
                            <td className="py-2 px-2 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-center">
                                {new Date(profile.updatedAt).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AmazonProfile;
