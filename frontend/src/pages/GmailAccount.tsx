// frontend\src\pages\GmailAccount.tsx

import React, { useEffect, useState } from 'react';

interface GmailAccount {
    Email: string;
    Password: string;
    RecoveryEmail: string;
    Used: boolean;
}

const GmailAccountComponent: React.FC = () => {
    const [emailAccounts, setEmailAccounts] = useState<GmailAccount[]>([]);

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

    const handleDelete = async (email: string) => {
        if (window.confirm("정말 삭제하시겠습니까?")) {
            try {
                await window.go.db.EmailDB.DeleteEmail(email);
                fetchEmailAccounts();
            } catch (error) {
                console.error("Failed to delete email account:", error);
            }
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

    return (
        <div className="p-6 bg-white dark:bg-dark-bg rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-text-dark dark:text-text-light">Gmail 계정</h1>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-light-bg-light dark:bg-dark-bg-light">
                        <th className="py-3 px-4 font-semibold text-sm text-text-dark dark:text-text-light border-b border-gray-200 dark:border-gray-700">Gmail</th>
                        <th className="py-3 px-4 font-semibold text-sm text-text-dark dark:text-text-light border-b border-gray-200 dark:border-gray-700">비밀번호</th>
                        <th className="py-3 px-4 font-semibold text-sm text-text-dark dark:text-text-light border-b border-gray-200 dark:border-gray-700">복구 이메일</th>
                        <th className="py-3 px-4 font-semibold text-sm text-text-dark dark:text-text-light border-b border-gray-200 dark:border-gray-700">사용 여부</th>
                        <th className="py-3 px-4 font-semibold text-sm text-text-dark dark:text-text-light border-b border-gray-200 dark:border-gray-700">삭제</th>
                    </tr>
                    </thead>
                    <tbody>
                    {emailAccounts.map((account) => (
                        <tr key={account.Email} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="py-4 px-4 border-b border-gray-200 dark:border-gray-700 text-text-dark dark:text-text-light">{account.Email}</td>
                            <td className="py-4 px-4 border-b border-gray-200 dark:border-gray-700 text-text-dark dark:text-text-light">{account.Password}</td>
                            <td className="py-4 px-4 border-b border-gray-200 dark:border-gray-700 text-text-dark dark:text-text-light">{account.RecoveryEmail}</td>
                            <td className="py-4 px-4 border-b border-gray-200 dark:border-gray-700 text-center">
                                <input
                                    type="checkbox"
                                    checked={account.Used}
                                    onChange={() => handleToggleUsed(account.Email, account.Used)}
                                    className="form-checkbox h-5 w-5 text-primary transition duration-150 ease-in-out"
                                />
                            </td>
                            <td className="py-4 px-4 border-b border-gray-200 dark:border-gray-700 text-center">
                                <button
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-300 ease-in-out"
                                    onClick={() => handleDelete(account.Email)}
                                >
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GmailAccountComponent;
