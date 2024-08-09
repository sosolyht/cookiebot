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
                IsAntiDetectRunning(): Promise<boolean>;
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
        },
        browser: {
            BrowserManager: {
                AddProfile(arg1: string): Promise<void>;
                FetchProfiles(): Promise<Array<string>>;
                LaunchProfile(arg1: string): Promise<void>;
                ModifyProfile(profileID: string, req: ModifyProfileRequest): Promise<any>;
                RemoveProfile(arg1: string): Promise<void>;
                StopProfile(arg1: string): Promise<void>;
                FetchProfileInfo(profileID: string): Promise<ProfileInfoResponse>; // 추가된 부분
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

// 수정된 ProfileInfoResponse 인터페이스
interface ProfileInfoResponse {
    code: number;
    status: string;
    data: Profile; // Profile 구조체를 사용하여 데이터 정의
}

// 수정된 Profile 인터페이스
interface Profile {
    name: string;
    status: string;
    debug_port: string;
    websocket_link: string;
    folder: string;
    tags: string[];
    cloud_id: string;
    creation_date: number;
    modify_date: number;
    configid: string;      // 추가된 필드
    type: string;         // 추가된 필드
    proxy: string;        // 추가된 필드
    notes: string;        // 추가된 필드
    useragent: string;    // 추가된 필드
    browser: string;      // 추가된 필드
    os: string;           // 추가된 필드
    screen: string;       // 추가된 필드
    language: string;     // 추가된 필드
    cpu: number;          // 추가된 필드
    memory: number;       // 추가된 필드
}
