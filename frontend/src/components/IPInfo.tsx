// frontend/src/components/IPInfo.tsx

import React, { useEffect, useState } from 'react';
import { Flag } from 'lucide-react'; // 국가 아이콘 추가

interface IPInfo {
    country: string;
    region: string;
}

interface IPInfoProps {
    ip: string;
}

const IPInfo: React.FC<IPInfoProps> = ({ ip }) => {
    const [info, setInfo] = useState<IPInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchIPInfo = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://ipinfo.io/${ip}?token=cea84453c75db2`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setInfo({
                    country: data.country || 'N/A',
                    region: data.region || 'N/A',
                });
            } catch (error) {
                setError('프록시 정보를 입력해주세요');
            } finally {
                setLoading(false);
            }
        };

        fetchIPInfo();
    }, [ip]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="flex items-center">
            <Flag className="h-4 w-4 mr-1" />
            <span>{info?.country} - {info?.region}</span>
        </div>
    );
};

export default IPInfo;
