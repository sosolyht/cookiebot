// frontend/src/pages/BrowserProfile.tsx

import React, { useEffect, useState } from 'react';
import { Play, StopCircle, Settings } from 'lucide-react';
import IPInfo from '../components/IPInfo';
import ProfileSettingsModal from './ProfileSettingsModal';

interface Profile {
    id: string;
    name: string;
    status: string; // "running" 또는 "stopped" 상태로 가정
    creation_date: number;
    ip: string; // 기본 IP 정보
    proxy?: string; // 프록시 정보
    notes?: string;
    folder?: string;
    tags?: string[];
    geolocation?: string;
    accounts?: Array<{ website: string; username: string; password: string }>;
    timezone?: string;
}

interface ApiResponse {
    code: number;
    status: string;
    data: {
        [key: string]: Profile;
    };
}

const BrowserProfile: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await window.go.browser.BrowserManager.FetchProfiles() as unknown as ApiResponse;

            if (response && response.status === "success" && response.data) {
                const profilesArray = await Promise.all(
                    Object.keys(response.data).map(async (profileId) => {
                        const profileInfoResponse = await window.go.browser.BrowserManager.FetchProfileInfo(profileId) as unknown as ProfileInfoResponse;

                        if (profileInfoResponse && profileInfoResponse.status === "success" && profileInfoResponse.data) {
                            const profileInfo = profileInfoResponse.data;

                            const ip = profileInfo.proxy ? await getProxyIP(profileInfo.proxy) : '';

                            return {
                                id: profileId,
                                name: profileInfo.name,
                                status: profileInfo.status,
                                creation_date: profileInfo.creation_date ? profileInfo.creation_date * 1000 : 0,
                                ip: ip,
                                proxy: profileInfo.proxy,
                                folder: profileInfo.folder,
                                tags: profileInfo.tags,
                                notes: profileInfo.notes,
                                useragent: profileInfo.useragent,
                                browser: profileInfo.browser,
                                os: profileInfo.os,
                                screen: profileInfo.screen,
                                language: profileInfo.language,
                                cpu: profileInfo.cpu,
                                memory: profileInfo.memory,
                                debug_port: profileInfo.debug_port,
                                websocket_link: profileInfo.websocket_link,
                                cloud_id: profileInfo.cloud_id,
                                modify_date: profileInfo.modify_date
                            } as Profile;
                        } else {
                            setError("Failed to fetch profile info for ID: " + profileId);
                            return null;
                        }
                    })
                );

                const filteredProfilesArray: Profile[] = profilesArray.filter((profile): profile is Profile => profile !== null);
                setProfiles(filteredProfilesArray);
            } else {
                setError("Unexpected response format: " + JSON.stringify(response));
            }
        } catch (error) {
            setError("Failed to fetch profiles: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const getProxyIP = async (proxy: string): Promise<string> => {
        const proxyParts = proxy.split(':');
        const ip = proxyParts[1].replace('socks5://', '').replace('http://', '');
        return ip;
    };

    const handleProfileSettingsOpen = (profile: Profile) => {
        setSelectedProfile(profile);
        setIsSettingsModalOpen(true);
    };

    const handleProfileSettingsClose = () => {
        setSelectedProfile(null);
        setIsSettingsModalOpen(false);
    };

    const handleProfileUpdate = (updatedProfile: Partial<Profile>) => {
        if (selectedProfile) {
            setProfiles(profiles.map(profile =>
                profile.id === selectedProfile.id ? { ...profile, ...updatedProfile } : profile
            ));
        }
    };

    const handleStopProfile = async (profileId: string) => {
        try {
            await window.go.browser.BrowserManager.StopProfile(profileId);
            // 프로필 상태를 "stopped"로 업데이트
            setProfiles(profiles.map(profile =>
                profile.id === profileId ? { ...profile, status: "stopped" } : profile
            ));
        } catch (error) {
            console.error("Failed to stop profile:", error);
        }
    };

    const handleStartProfile = async (profileId: string) => {
        try {
            await window.go.browser.BrowserManager.LaunchProfile(profileId);
            // 프로필 상태를 "running"으로 업데이트
            setProfiles(profiles.map(profile =>
                profile.id === profileId ? { ...profile, status: "running" } : profile
            ));
        } catch (error) {
            console.error("Failed to start profile:", error);
        }
    };

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800">
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">프로필명</th>
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">상태</th>
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">IP
                                    정보
                                </th>
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">생성
                                    날짜
                                </th>
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">작업</th>
                            </tr>
                            </thead>
                            <tbody>
                            {profiles.map((profile) => (
                                <tr key={profile.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">{profile.name}</td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">{profile.status}</td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center">
                                        <IPInfo ip={profile.ip}/>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">
                                        {new Date(profile.creation_date).toLocaleString('ko-KR', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true, // 오전/오후 표시
                                        }).replace(',', '').replace(/\//g, '.').replace(' ', ' ')}
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center flex justify-center space-x-2">
                                        {profile.status === "running" ? (
                                            <>
                                                <button onClick={() => handleStopProfile(profile.id)}
                                                        className="flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full">
                                                    <StopCircle className="h-5 w-5"/>
                                                </button>
                                                <button disabled
                                                        className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full cursor-not-allowed">
                                                    <Play className="h-5 w-5"/>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleStartProfile(profile.id)}
                                                        className="flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full">
                                                    <Play className="h-5 w-5"/>
                                                </button>
                                                <button disabled
                                                        className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full cursor-not-allowed">
                                                    <StopCircle className="h-5 w-5"/>
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => handleProfileSettingsOpen(profile)}
                                                className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <Settings className="h-5 w-5"/>
                                        </button>
                                    </td>

                                </tr>
                            ))}
                            </tbody>

                        </table>
                    </div>
                </div>
            </div>
            {selectedProfile && (
                <ProfileSettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={handleProfileSettingsClose}
                    profileID={selectedProfile.id}
                    initialData={selectedProfile}
                    onUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
};

export default BrowserProfile;
