interface Runtime {
    LogInfo(message: string): void;
    LogError(message: string): void;
}

interface Window {
    runtime: Runtime;
    go: {
        vm: {
            VM: {
                CheckVMWareStatus(): Promise<{ vmrun_exists: boolean; vmware_exists: boolean; vm_folder_exists: boolean; }>;
            },
            VMD: {
                DownloadAndInstallVMWare(): Promise<void>;
                GetInstallationProgress(): Promise<number>;
            }
        },
        antidetect: {
            ADD: {
                DownloadAndInstallAntiDetect(): Promise<void>;
                GetInstallationProgress(): Promise<number>;
                CheckAndRunAntiDetect(): Promise<void>;
                EnsureAntiDetectRunning(): Promise<void>;
                IsAntiDetectInstalled(): Promise<boolean>;
                RunAntiDetect(): Promise<void>;
            }
        },
        db: {
            EmailDB: {
                DeleteEmail(arg1: string): Promise<void>;
                GetEmail(arg1: string): Promise<GmailAccount>;
                ListEmails(): Promise<Array<GmailAccount>>;
                SaveEmail(arg1: GmailAccount): Promise<void>;
            }
        }
    }
}

interface GmailAccount {
    Email: string;
    Password: string;
    RecoveryEmail: string;
    Used: boolean;
}
