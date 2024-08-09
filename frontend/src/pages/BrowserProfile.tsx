import React, { useEffect, useState } from 'react';
import { Play, Pause, StopCircle, Settings } from 'lucide-react';
import IPInfo from '../components/IPInfo'; // IPInfo 컴포넌트 임포트
import ProfileSettingsModal from './ProfileSettingsModal'; // 모달 컴포넌트 임포트

interface Profile {
    id: string;
    name: string;
    status: string;
    creation_date: number;
    ip: string;
    proxy?: string;
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
                const profilesArray: Profile[] = Object.values(response.data).map((profile) => ({
                    ...profile,
                    creation_date: profile.creation_date * 1000, // Unix timestamp를 밀리초로 변환
                }));
                setProfiles(profilesArray);
            } else {
                setError("Unexpected response format: " + JSON.stringify(response));
            }
        } catch (error) {
            setError("Failed to fetch profiles: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
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

    const handleStart = (profileName: string) => {
        console.log(`Starting ${profileName}`);
        // 여기에 시작 로직을 추가하십시오.
    };

    const handlePause = (profileName: string) => {
        console.log(`Pausing ${profileName}`);
        // 여기에 일시중지 로직을 추가하십시오.
    };

    const handleStop = (profileName: string) => {
        console.log(`Stopping ${profileName}`);
        // 여기에 중지 로직을 추가하십시오.
    };

    const handleSettings = (profile: Profile) => {
        handleProfileSettingsOpen(profile);
    };

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
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">실행</th>
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">일시중지</th>
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">정지</th>
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
                                        <button onClick={() => handleStart(profile.name)} className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <Play className="h-5 w-5" />
                                        </button>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center">
                                        <button onClick={() => handlePause(profile.name)} className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <Pause className="h-5 w-5" />
                                        </button>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center">
                                        <button onClick={() => handleStop(profile.name)} className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <StopCircle className="h-5 w-5" />
                                        </button>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center">
                                        <button onClick={() => handleSettings(profile)} className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
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
                    initialData={selectedProfile}
                    onUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
};

export default BrowserProfile;
