// frontend/src/pages/BrowserProfile.tsx

import React, { useEffect, useState } from 'react';
import { Play, Pause, StopCircle, Settings } from 'lucide-react';
import IPInfo from '../components/IPInfo';
import ProfileSettingsModal from './ProfileSettingsModal';

interface Profile {
    id: string;
    name: string;
    status: string;
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
            // 1단계: 프로필 목록을 가져옵니다.
            const response = await window.go.browser.BrowserManager.FetchProfiles() as unknown as ApiResponse;

            if (response && response.status === "success" && response.data) {
                const profilesArray = await Promise.all(
                    Object.keys(response.data).map(async (profileId) => {
                        const profileInfoResponse = await window.go.browser.BrowserManager.FetchProfileInfo(profileId) as unknown as ProfileInfoResponse;

                        if (profileInfoResponse && profileInfoResponse.status === "success" && profileInfoResponse.data) {
                            const profileInfo = profileInfoResponse.data;

                            // 프록시가 있을 경우 IP를 설정
                            const ip = profileInfo.proxy ? await getProxyIP(profileInfo.proxy) : '';

                            // 2단계: 프로필 정보를 반환합니다.
                            return {
                                id: profileId,
                                name: profileInfo.name,
                                status: profileInfo.status,
                                creation_date: profileInfo.creation_date ? profileInfo.creation_date * 1000 : 0, // 기본값 설정
                                ip: ip, // 프록시에서 가져온 IP
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
                                debug_port: profileInfo.debug_port, // Profile에 맞추어 추가
                                websocket_link: profileInfo.websocket_link, // Profile에 맞추어 추가
                                cloud_id: profileInfo.cloud_id, // Profile에 맞추어 추가
                                modify_date: profileInfo.modify_date // Profile에 맞추어 추가
                            } as Profile; // 타입 단언
                        } else {
                            setError("Failed to fetch profile info for ID: " + profileId);
                            return null; // 프로필 정보를 가져오지 못한 경우 null을 반환
                        }
                    })
                );

                // null 값을 필터링하여 Profile[] 타입으로 설정
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



    // 프록시 IP를 가져오는 함수
    const getProxyIP = async (proxy: string): Promise<string> => {
        const proxyParts = proxy.split(':');
        // 프록시 IP를 가져옵니다. 예: socks5://123.45.67.89:1080 -> 123.45.67.89
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
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-left">프로필명</th>
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">상태</th>
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">IP 정보</th>
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">생성 날짜</th>
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">설정</th>
                            </tr>
                            </thead>
                            <tbody>
                            {profiles.map((profile) => (
                                <tr key={profile.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">{profile.name}</td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">{profile.status}</td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center">
                                        <IPInfo ip={profile.ip} />
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">{new Date(profile.creation_date).toLocaleString()}</td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center">
                                        <button onClick={() => handleProfileSettingsOpen(profile)} className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <Settings className="h-5 w-5" />
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
                    initialData={selectedProfile} // 선택된 프로필 데이터를 전달
                    onUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
};

export default BrowserProfile;
