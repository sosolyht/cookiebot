// frontend\src\App.tsx

import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faStop, faCog } from '@fortawesome/free-solid-svg-icons';

declare global {
    interface Window {
        go: {
            main: {
                App: {
                    CheckVMWareStatus(): Promise<{ vmrun_exists: boolean; vmware_exists: boolean; vm_folder_exists: boolean; }>;
                    DownloadAndInstallVMWare(): Promise<void>;
                    GetInstallationProgress(): Promise<number>;
                }
            }
        }
    }
}

interface VM {
    id: number;
    name: string;
    ip: string;
    location: string;
    isChecked: boolean;
}

const initialVMs: VM[] = [
    { id: 1, name: "VM1", ip: "192.168.1.1", location: "USA", isChecked: false },
    { id: 2, name: "VM2", ip: "192.168.1.2", location: "Canada", isChecked: false },
];

const STATUS_MESSAGES = {
    INSTALLED: "VMWare가 정상적으로 설치되어 있습니다.",
    INSTALLED_NO_VMS: "VMWare가 설치되어 있지만 가상 머신이 없습니다.",
    NOT_INSTALLED: "VMWare가 설치되어 있지 않습니다.",
    INSTALLING: "다운로드 중...",
    DOWNLOAD_COMPLETE: "다운로드가 완료되었습니다.",
    ERROR: "오류가 발생했습니다. VMWare를 직접 설치해 주세요."
};

function App() {
    const [vms, setVMs] = useState<VM[]>(initialVMs);
    const [vmwareStatus, setVMwareStatus] = useState({ isInstalled: false, hasVMs: false });
    const [isInstalling, setIsInstalling] = useState<boolean>(false);
    const [installationProgress, setInstallationProgress] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [downloadComplete, setDownloadComplete] = useState<boolean>(false);

    useEffect(() => {
        checkVMWareStatus();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isInstalling) {
            interval = setInterval(async () => {
                const progress = await window.go.main.App.GetInstallationProgress();
                setInstallationProgress(progress);
                if (progress >= 100) {
                    clearInterval(interval!);
                    setIsInstalling(false);
                    setDownloadComplete(true);
                }
            }, 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isInstalling]);

    useEffect(() => {
        let statusCheckInterval: NodeJS.Timeout | null = null;
        if (!vmwareStatus.isInstalled || !vmwareStatus.hasVMs) {
            statusCheckInterval = setInterval(async () => {
                await checkVMWareStatus();
            }, 4000);
        }
        return () => {
            if (statusCheckInterval) {
                clearInterval(statusCheckInterval);
            }
        };
    }, [vmwareStatus]);

    const checkVMWareStatus = async () => {
        try {
            const response = await window.go.main.App.CheckVMWareStatus();
            console.log("Response from CheckVMWareStatus:", response); // 응답 로그
            if (typeof response !== 'object' || response === null ||
                typeof response.vmrun_exists !== 'boolean' ||
                typeof response.vmware_exists !== 'boolean' ||
                typeof response.vm_folder_exists !== 'boolean') {
                console.error("Expected an object with three boolean properties.");
                setErrorMessage("VMWare 상태 확인 중 오류 발생: 응답이 유효하지 않습니다.");
                return;
            }

            const { vmrun_exists, vmware_exists, vm_folder_exists } = response;

            const isInstalled = vmrun_exists && vmware_exists;
            setVMwareStatus({ isInstalled, hasVMs: vm_folder_exists });

            if (isInstalled && vm_folder_exists) {
                setDownloadComplete(false); // 설치 완료되면 다운로드 완료 상태 해제
            } else if (!isInstalling && !downloadComplete) {
                handleInstallVMWare();
            }
        } catch (error) {
            console.error("VMWare 상태 확인 중 오류 발생:", error);
            setErrorMessage("VMWare 상태 확인 중 오류가 발생했습니다: " + (error as Error).message);
        }
    };

    const handleInstallVMWare = async () => {
        setIsInstalling(true);
        setErrorMessage(null);
        try {
            await window.go.main.App.DownloadAndInstallVMWare();
        } catch (error) {
            console.error("VMWare 설치 중 오류 발생:", error);
            setErrorMessage(STATUS_MESSAGES.ERROR);
            setIsInstalling(false);
        }
    };

    const handleCheck = (id: number) => {
        setVMs(vms.map(vm => vm.id === id ? { ...vm, isChecked: !vm.isChecked } : vm));
    };

    const startAll = () => {
        console.log("Starting all selected VMs");
    };

    const stopAll = () => {
        console.log("Stopping all selected VMs");
    };

    const handlePurchaseClick = () => {
        console.log("구매 버튼 클릭");
    };

    const statusMessage = useMemo(() => {
        if (errorMessage) return errorMessage;
        if (isInstalling) return `${STATUS_MESSAGES.INSTALLING} (${installationProgress}%)`;
        if (downloadComplete) return STATUS_MESSAGES.DOWNLOAD_COMPLETE;
        return vmwareStatus.isInstalled ?
            (vmwareStatus.hasVMs ? STATUS_MESSAGES.INSTALLED : STATUS_MESSAGES.INSTALLED_NO_VMS) :
            STATUS_MESSAGES.NOT_INSTALLED;
    }, [errorMessage, isInstalling, installationProgress, vmwareStatus, downloadComplete]);

    const isAnyVMChecked = useMemo(() => vms.some(vm => vm.isChecked), [vms]);

    return (
        <div id="App">
            <StatusBar
                statusMessage={statusMessage}
                isInstalling={isInstalling}
                downloadComplete={downloadComplete}
                vmwareStatus={vmwareStatus}
                onPurchaseClick={handlePurchaseClick}
            />
            {!vmwareStatus.isInstalled && (
                <InstallProgress isInstalling={isInstalling} progress={installationProgress} />
            )}
            <VMList vms={vms} onCheck={handleCheck} />
            <ControlPanel
                onStartAll={startAll}
                onStopAll={stopAll}
                disabled={!isAnyVMChecked || !vmwareStatus.isInstalled}
            />
        </div>
    );
}

interface StatusBarProps {
    statusMessage: string;
    isInstalling: boolean;
    downloadComplete: boolean;
    vmwareStatus: { isInstalled: boolean; hasVMs: boolean };
    onPurchaseClick: () => void;
}

function StatusBar({ statusMessage, isInstalling, downloadComplete, vmwareStatus, onPurchaseClick }: StatusBarProps) {
    const statusColor = statusMessage.includes("오류") ? 'red' :
        isInstalling ? 'orange' :
            downloadComplete ? 'orange' :
                vmwareStatus.isInstalled ? (vmwareStatus.hasVMs ? 'green' : 'orange') : 'red';

    return (
        <div className="status-container">
            <div className="status-message" style={{ color: statusColor }}>
                {statusMessage}
            </div>
            <div className="top-right-controls">
                <span>잔액: $0</span>
                <span>활성화 IP: 0개</span>
                <button className="purchase-button" onClick={onPurchaseClick}>구매</button>
            </div>
        </div>
    );
}

interface InstallProgressProps {
    isInstalling: boolean;
    progress: number;
}

function InstallProgress({ isInstalling, progress }: InstallProgressProps) {
    if (!isInstalling) return null;

    return (
        <div className="install-container">
            <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
}

interface VMListProps {
    vms: VM[];
    onCheck: (id: number) => void;
}

function VMList({ vms, onCheck }: VMListProps) {
    return (
        <div className="vm-list">
            {vms.map(vm => (
                <div key={vm.id} className="vm-item">
                    <input type="checkbox" checked={
vm.isChecked} onChange={() => onCheck(vm.id)} />
                    <span className="vm-name">{vm.name}</span>
                    <span>{vm.ip}</span>
                    <span>{vm.location}</span>
                    <div className="buttons">
                        <button><FontAwesomeIcon icon={faPlay} /></button>
                        <button><FontAwesomeIcon icon={faPause} /></button>
                        <button><FontAwesomeIcon icon={faStop} /></button>
                        <button><FontAwesomeIcon icon={faCog} /></button>
                    </div>
                </div>
            ))}
        </div>
    );
}

interface ControlPanelProps {
    onStartAll: () => void;
    onStopAll: () => void;
    disabled: boolean;
}

function ControlPanel({ onStartAll, onStopAll, disabled }: ControlPanelProps) {
    return (
        <div className="controls">
            <button onClick={onStartAll} disabled={disabled}>모두 시작</button>
            <button onClick={onStopAll} disabled={disabled}>모두 중지</button>
        </div>
    );
}

export default App;
