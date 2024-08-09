// frontend/src/pages/ProfileSettingsModal.tsx

import React, { useState } from 'react';

interface ModifyProfileRequest {
    proxy?: string;
    notes?: string;
    name?: string;
    folder?: string;
    tags?: string[];
    geolocation?: string;
    accounts?: Array<{ website: string; username: string; password: string }>;
    timezone?: string;
}

interface ProfileSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    profileID: string;
    initialData: {
        proxy?: string;
        notes?: string;
        name?: string;
        folder?: string;
        tags?: string[];
        geolocation?: string;
        accounts?: Array<{ website: string; username: string; password: string }>;
        timezone?: string;
    };
    onUpdate: (data: any) => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose, profileID, initialData, onUpdate }) => {
    const [proxy, setProxy] = useState(initialData.proxy || '');
    const [notes, setNotes] = useState(initialData.notes || '');
    const [name, setName] = useState(initialData.name || '');
    const [folder, setFolder] = useState(initialData.folder || '');
    const [tags, setTags] = useState(initialData.tags || []);
    const [geolocation, setGeolocation] = useState(initialData.geolocation || '');
    const [accounts, setAccounts] = useState(initialData.accounts || []);
    const [timezone, setTimezone] = useState(initialData.timezone || '');

    const handleUpdate = async () => {
        const updateData: ModifyProfileRequest = {
            proxy: proxy || undefined,
            notes: notes || undefined,
            name: name || undefined,
            folder: folder || undefined,
            tags: tags.length > 0 ? tags : undefined,
            geolocation: geolocation || undefined,
            accounts: accounts.length > 0 ? accounts : undefined,
            timezone: timezone || undefined,
        };

        try {
            // 데이터를 JSON 문자열로 변환하여 API 호출
            await window.go.browser.BrowserManager.ModifyProfile(profileID, JSON.stringify(updateData));
            onUpdate(updateData);
            onClose();
        } catch (error) {
            console.error("프로필 업데이트 오류:", error);
        }
    };

    const handleAddAccount = () => {
        setAccounts([...accounts, { website: '', username: '', password: '' }]);
    };

    const handleAccountChange = (index: number, field: string, value: string) => {
        const newAccounts = [...accounts];
        newAccounts[index] = { ...newAccounts[index], [field]: value };
        setAccounts(newAccounts);
    };

    const handleRemoveAccount = (index: number) => {
        const newAccounts = accounts.filter((_, i) => i !== index);
        setAccounts(newAccounts);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
                <h2 className="text-lg font-semibold mb-4">프로필 설정</h2>
                {/* 프록시 입력 필드 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium">프록시</label>
                    <input
                        type="text"
                        value={proxy}
                        onChange={(e) => setProxy(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                {/* 노트 입력 필드 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium">노트</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                {/* 이름 입력 필드 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium">프로필 이름</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                {/* 폴더 입력 필드 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium">폴더</label>
                    <input
                        type="text"
                        value={folder}
                        onChange={(e) => setFolder(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                {/* 태그 입력 필드 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium">태그</label>
                    <input
                        type="text"
                        value={tags.join(', ')}
                        onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                {/* 지리 위치 입력 필드 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium">지리 위치</label>
                    <input
                        type="text"
                        value={geolocation}
                        onChange={(e) => setGeolocation(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                {/* 타임존 입력 필드 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium">타임존</label>
                    <input
                        type="text"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                {/* 계정 정보 입력 필드 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium">계정 정보</label>
                    {accounts.map((account, index) => (
                        <div key={index} className="flex mb-2">
                            <input
                                type="text"
                                placeholder="웹사이트"
                                value={account.website}
                                onChange={(e) => handleAccountChange(index, 'website', e.target.value)}
                                className="mt-1 block w-1/3 border-gray-300 rounded-md shadow-sm mr-1"
                            />
                            <input
                                type="text"
                                placeholder="사용자 이름"
                                value={account.username}
                                onChange={(e) => handleAccountChange(index, 'username', e.target.value)}
                                className="mt-1 block w-1/3 border-gray-300 rounded-md shadow-sm mr-1"
                            />
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={account.password}
                                onChange={(e) => handleAccountChange(index, 'password', e.target.value)}
                                className="mt-1 block w-1/3 border-gray-300 rounded-md shadow-sm mr-1"
                            />
                            <button onClick={() => handleRemoveAccount(index)} className="text-red-500 ml-2">삭제</button>
                        </div>
                    ))}
                    <button onClick={handleAddAccount} className="text-blue-500">계정 추가</button>
                </div>
                {/* 저장 및 취소 버튼 */}
                <div className="flex justify-between">
                    <button onClick={onClose} className="text-gray-600">취소</button>
                    <button onClick={handleUpdate} className="bg-blue-500 text-white rounded-md px-4 py-2">저장</button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsModal;
