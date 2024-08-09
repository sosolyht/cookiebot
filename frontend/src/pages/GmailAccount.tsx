// frontend/src/pages/GmailAccount.tsx

import React, { useEffect, useState } from 'react';

interface GmailAccount {
    Email: string;
    Password: string;
    RecoveryEmail: string;
    Used: boolean;
}

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                {children}
            </div>
        </div>
    );
};

const GmailAccountPage: React.FC = () => {
    const [emailAccounts, setEmailAccounts] = useState<GmailAccount[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState('');

    useEffect(() => {
        fetchEmailAccounts();
    }, []);

    const fetchEmailAccounts = async () => {
        try {
            const accounts = await window.go.db.EmailDB.ListEmails();
            setEmailAccounts(accounts);
        } catch (error) {
            console.error("Failed to fetch email accounts:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await window.go.db.EmailDB.DeleteEmail(selectedEmail);
            setIsDeleteModalOpen(false);
            fetchEmailAccounts();
        } catch (error) {
            console.error("Failed to delete email account:", error);
        }
    };

    const handleToggleUsed = async (email: string, used: boolean) => {
        try {
            const account = await window.go.db.EmailDB.GetEmail(email);
            account.Used = !used;
            await window.go.db.EmailDB.SaveEmail(account);
            fetchEmailAccounts();
        } catch (error) {
            console.error("Failed to update email account:", error);
        }
    };

    const handleCopy = async (email: string) => {
        try {
            const account = await window.go.db.EmailDB.GetEmail(email);
            navigator.clipboard.writeText(`${account.Email}:${account.Password}:${account.RecoveryEmail}`);
            setSelectedEmail(email);
            setIsCopyModalOpen(true);
        } catch (error) {
            console.error("Failed to copy email account:", error);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800">
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-left">Gmail</th>
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-left">비밀번호</th>
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-left">복구 이메일</th>
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">사용 여부</th>
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">삭제</th>
                                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">복사</th>
                            </tr>
                            </thead>
                            <tbody>
                            {emailAccounts.map((account) => (
                                <tr key={account.Email} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 truncate">{account.Email}</td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 truncate">{account.Password}</td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 truncate">{account.RecoveryEmail}</td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center">
                                        <button
                                            onClick={() => handleToggleUsed(account.Email, account.Used)}
                                            className={`px-3 py-1 rounded transition duration-300 ease-in-out ${
                                                account.Used
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                            }`}
                                        >
                                            {account.Used ? '사용중' : '미사용'}
                                        </button>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center">
                                        <button
                                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition duration-300 ease-in-out"
                                            onClick={() => {
                                                setSelectedEmail(account.Email);
                                                setIsDeleteModalOpen(true);
                                            }}
                                        >
                                            삭제
                                        </button>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-center">
                                        <button
                                            className={`px-3 py-1 rounded transition duration-300 ease-in-out ${
                                                account.Used
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                            }`}
                                            onClick={() => !account.Used && handleCopy(account.Email)}
                                            disabled={account.Used}
                                        >
                                            복사
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">계정 삭제 확인</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        정말 이 계정을 삭제하시겠습니까?<br />
                        이 작업은 되돌릴 수 없습니다.
                    </p>
                    <div className="flex justify-center space-x-3">
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 rounded-md transition-colors duration-200"
                        >
                            삭제
                        </button>
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                        >
                            취소
                        </button>
                    </div>
                </Modal>

                <Modal isOpen={isCopyModalOpen} onClose={() => setIsCopyModalOpen(false)}>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">계정 사용 확인</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        이 이메일 계정을 사용하시겠습니까? 사용하면 상태가<br />
                        <b>'사용중'</b> 으로 변경됩니다.
                    </p>
                    <div className="flex justify-center space-x-3">
                        <button
                            onClick={() => {
                                handleToggleUsed(selectedEmail, false);
                                setIsCopyModalOpen(false);
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-md transition-colors duration-200"
                        >
                            사용
                        </button>
                        <button
                            onClick={() => setIsCopyModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                        >
                            닫기
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default GmailAccountPage;
