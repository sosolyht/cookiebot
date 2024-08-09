// frontend/src/components/IPInfo.tsx

import React, { useEffect, useState } from 'react';
import ReactCountryFlag from 'react-country-flag'; // 국기 아이콘 추가

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
        return <div className="ip-info-error">{error}</div>; // 오류 메시지 스타일 적용
    }

    return (
        <div className="ip-info-container"> {/* 전체 컨테이너 스타일 적용 */}
            {info?.country ? (
                <ReactCountryFlag
                    countryCode={info.country}
                    svg
                    className="ip-info-flag" // 국기 아이콘 스타일 적용
                    title={info.country}
                />
            ) : (
                <div className="h-8 w-8" /> // 빈 공간을 유지하기 위해 대체 요소 추가
            )}
            <span className="ip-info-text">{info?.country || 'N/A'} - {info?.region || 'N/A'}</span> {/* 텍스트 스타일 적용 */}
        </div>
    );
};

export default IPInfo;
