// frontend/src/pages/ProfileSettingsModal.tsx

import React, { useState } from 'react';

interface ModifyProfileRequest {
    proxy: string;
    notes: string;
    name: string;
    folder: string;
    tags: string[];
    geolocation: string;
    cookies: object[];
    type: string;
    group: string;
    accounts: Array<{ website: string; username: string; password: string }>;
    timezone: string;
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
    const [type, setType] = useState('');
    const [group, setGroup] = useState('');
    const [cookies, setCookies] = useState<string>(''); // 쿠키 상태를 문자열로 설정

    const handleUpdate = async () => {
        const updateData: ModifyProfileRequest = {
            proxy: proxy || '',
            notes: notes || '',
            name: name || '',
            folder: folder || '',
            tags: tags.length > 0 ? tags : [],
            geolocation: geolocation || '',
            cookies: cookies ? JSON.parse(cookies) : [{}], // JSON 문자열로 변환
            type: type || '',
            group: group || '',
            accounts: accounts.length > 0 ? accounts : [],
            timezone: timezone || '',
        };

        console.log("업데이트할 데이터:", updateData, null, 2);

        try {
            await window.go.browser.BrowserManager.ModifyProfile(profileID, updateData);
            onUpdate(updateData);
            onClose();
            console.log(JSON.stringify(updateData));
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
            <div className="bg-gray-900 rounded-lg p-6 w-full max-w-3xl">
                <h2 className="text-lg font-semibold mb-4 text-white">프로필 설정</h2>

                {/* 프록시 입력 필드 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">프록시</label>
                    <input
                        type="text"
                        value={proxy}
                        onChange={(e) => setProxy(e.target.value)}
                        className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2" // padding 추가
                        placeholder="socks5://127.0.0.1:5555:login:pass"
                    />
                </div>

                {/* 노트 입력 필드 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">노트</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2" // padding 추가
                        placeholder="노트 입력"
                    />
                </div>

                {/* 이름 및 폴더 입력 필드 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">프로필 이름</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2" // padding 추가
                            placeholder="이름 입력"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">폴더</label>
                        <input
                            type="text"
                            value={folder}
                            onChange={(e) => setFolder(e.target.value)}
                            className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2" // padding 추가
                            placeholder="폴더 입력"
                        />
                    </div>
                </div>

                {/* 태그 및 지리 위치 입력 필드 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">태그</label>
                        <input
                            type="text"
                            value={tags.join(', ')}
                            onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))}
                            className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2" // padding 추가
                            placeholder="태그 입력"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">지리 위치</label>
                        <input
                            type="text"
                            value={geolocation}
                            onChange={(e) => setGeolocation(e.target.value)}
                            className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2" // padding 추가
                            placeholder="지리 위치 입력"
                        />
                    </div>
                </div>

                {/* 타임존 입력 필드 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">타임존</label>
                    <input
                        type="text"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2" // padding 추가
                        placeholder="타임존 입력"
                    />
                </div>

                {/* 쿠키 입력 필드 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">쿠키 정보 (JSON 형식)</label>
                    <textarea
                        value={cookies}
                        onChange={(e) => setCookies(e.target.value)}
                        placeholder='{"key": "value"}'
                        className="mt-1 block w-full h-24 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2" // padding 추가
                    />
                </div>

                {/* 계정 추가 버튼 */}
                <div className="mb-4">
                    <button onClick={handleAddAccount} className="text-blue-500">계정 추가</button>
                </div>
                {/* 계정 정보 입력 필드 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">계정 정보</label>
                    {accounts.map((account, index) => (
                        <div key={index} className="flex mb-2">
                            <input
                                type="text"
                                placeholder="웹사이트"
                                value={account.website}
                                onChange={(e) => handleAccountChange(index, 'website', e.target.value)}
                                className="mt-1 block w-1/3 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 mr-1 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2" // padding 추가
                            />
                            <input
                                type="text"
                                placeholder="사용자 이름"
                                value={account.username}
                                onChange={(e) => handleAccountChange(index, 'username', e.target.value)}
                                className="mt-1 block w-1/3 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 mr-1 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2" // padding 추가
                            />
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={account.password}
                                onChange={(e) => handleAccountChange(index, 'password', e.target.value)}
                                className="mt-1 block w-1/3 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 mr-1 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2" // padding 추가
                            />
                            <button onClick={() => handleRemoveAccount(index)} className="text-red-500 ml-2">삭제</button>
                        </div>
                    ))}
                </div>

                {/* 저장 및 취소 버튼 */}
                <div className="flex justify-between">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-300">취소</button>
                    <button onClick={handleUpdate} className="bg-blue-500 text-white rounded-md px-4 py-2">저장</button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsModal;
