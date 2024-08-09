import React, { useState, useEffect, useRef } from 'react';
import { Download, CheckCircle, AlertCircle, Play } from 'lucide-react';

interface AntiDetectStatusProps {
    onStatusChange: (status: string, color: string, installed: boolean) => void;
    initialStatus: string;
    initialStatusColor: string;
    initialIsInstalled: boolean;
}

const AntiDetectStatus: React.FC<AntiDetectStatusProps> = ({
                                                               onStatusChange,
                                                               initialStatus,
                                                               initialStatusColor,
                                                               initialIsInstalled
                                                           }) => {
    const [isInstalled, setIsInstalled] = useState(initialIsInstalled);
    const [isInstalling, setIsInstalling] = useState(false);
    const [isRunning, setIsRunning] = useState(initialStatus === '실행 중');
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const checkIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        const initialize = async () => {
            setIsLoading(true);
            await checkInitialStatus();
            setIsLoading(false);
        };
        initialize();

        return () => {
            if (checkIntervalRef.current !== null) {
                clearInterval(checkIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isInstalled && !isRunning) {
            handleRun();
        }
    }, [isInstalled, isRunning]);

    const checkInitialStatus = async () => {
        try {
            const installed = await window.go.antidetect.ADD.IsAntiDetectInstalled();
            setIsInstalled(installed);
            if (installed) {
                console.log("AntiDetect가 설치되어 있습니다. 실행을 시도합니다.");
                try {
                    await window.go.antidetect.ADD.RunAntiDetect();
                    console.log("AntiDetect를 성공적으로 실행했습니다.");
                    setIsRunning(true);
                } catch (runError) {
                    console.error("AntiDetect 실행 중 오류 발생:", runError);
                    setIsRunning(false);
                }
                startCheckingAndRunning();
            }
        } catch (error) {
            console.error("초기 상태 확인 중 오류 발생:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const startInstallation = async () => {
        try {
            setIsInstalling(true);
            setIsDownloading(true);
            onStatusChange('다운로드 중...', 'blue', false);

            // AntiDetect 다운로드 및 설치
            await window.go.antidetect.ADD.DownloadAndInstallAntiDetect();

            // 다운로드 및 설치 완료
            setIsDownloading(false);
            setIsInstalling(false);

            // 설치 상태 확인
            const installed = await window.go.antidetect.ADD.IsAntiDetectInstalled();
            setIsInstalled(installed);
        } catch (error) {
            console.error("설치 시작 중 오류 발생:", error);
            setIsInstalling(false);
            setIsDownloading(false);
            onStatusChange('설치 오류', 'red', false);
        }
    };

    const startCheckingAndRunning = () => {
        if (checkIntervalRef.current !== null) {
            clearInterval(checkIntervalRef.current);
        }
        checkIntervalRef.current = window.setInterval(checkAndRunAntiDetect, 1500);
    };

    const checkAndRunAntiDetect = async () => {
        try {
            const installed = await window.go.antidetect.ADD.IsAntiDetectInstalled();
            if (installed) {
                const running = await window.go.antidetect.ADD.IsAntiDetectRunning();
                console.log("AntiDetect 실행 상태:", running);

                if (!running) {
                    console.log("AntiDetect가 실행 중이 아닙니다. 실행을 시도합니다.");
                    await window.go.antidetect.ADD.RunAntiDetect();
                    setIsRunning(true);
                } else {
                    console.log("AntiDetect가 이미 실행 중입니다.");
                    setIsRunning(true);
                }
            } else {
                setIsRunning(false);
                onStatusChange('AntiDetect 설치 필요', 'red', false);
                if (checkIntervalRef.current !== null) {
                    clearInterval(checkIntervalRef.current);
                }
            }
        } catch (error) {
            console.error("AntiDetect 확인 중 오류 발생:", error);
            setIsRunning(false);
            onStatusChange('오류 발생', 'red', true);
        }
    };

    const handleRun = async () => {
        try {
            await window.go.antidetect.ADD.RunAntiDetect();
            setIsRunning(true);
            onStatusChange('AntiDetect가 실행 중입니다.', 'blue', true);
        } catch (error) {
            console.error("AntiDetect 실행 중 오류 발생:", error);
            setIsRunning(false);
            onStatusChange('AntiDetect 실행 오류', 'red', true);
        }
    };

    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 justify-center whitespace-nowrap">
                {isInstalled ? (
                    <>
                        <CheckCircle size={16} className="text-green-500" /> {/* 아이콘 크기 줄임 */}
                        <span className="text-md font-medium text-green-500"> {/* 글꼴 크기 줄임 */}
                            AntiDetect 설치 완료
                        </span>
                    </>
                ) : (
                    <>
                        <AlertCircle size={16} className="text-red-500" /> {/* 아이콘 크기 줄임 */}
                        <span className="text-md font-medium text-red-500"> {/* 글꼴 크기 줄임 */}
                            AntiDetect 설치 필요
                        </span>
                    </>
                )}
            </div>

            {!isInstalled && !isInstalling && !isDownloading && (
                <div className="flex justify-center">
                    <button
                        onClick={startInstallation}
                        className="flex items-center justify-center space-x-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors duration-300 whitespace-nowrap"
                    >
                        <Download size={16} />
                        <span>설치</span>
                    </button>
                </div>
            )}

            {isDownloading && (
                <div className="flex items-center space-x-2 text-blue-500 justify-center whitespace-nowrap">
                    <span className="text-md font-medium">다운로드 중...</span> {/* 글꼴 크기 줄임 */}
                </div>
            )}

            {isInstalled && !isInstalling && !isRunning && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={handleRun}
                        className="flex items-center justify-center space-x-2 px-4 py-1.5 bg-gradient-to-r from-green-400 to-blue-500 text-white text-sm font-medium rounded-md hover:from-green-500 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                        <Play size={16} />
                        <span>실행</span>
                    </button>
                </div>
            )}

            {isRunning && (
                <div className="flex items-center space-x-2 justify-center whitespace-nowrap">
                    <CheckCircle size={16} className="text-blue-500" /> {/* 아이콘 크기 줄임 */}
                    <span className="text-md font-medium text-blue-500"> {/* 글꼴 크기 줄임 */}
                        AntiDetect 실행 중
                    </span>
                </div>
            )}
        </div>
    );
};

export default AntiDetectStatus;
