// frontend\src\sidebar\VMSidebar.tsx

import React from 'react';
import Switch from 'react-switch';

interface VMSidebarProps {
    isAntiDetect: boolean;
    setIsAntiDetect: React.Dispatch<React.SetStateAction<boolean>>;
}

const VMSidebar: React.FC<VMSidebarProps> = ({
                                                 isAntiDetect,
                                                 setIsAntiDetect
                                             }) => {
    return (
        <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">VM Mode</span>
                <Switch
                    checked={!isAntiDetect}
                    onChange={() => setIsAntiDetect(!isAntiDetect)}
                    onColor="#86d3ff"
                    onHandleColor="#2693e6"
                    handleDiameter={24}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                    height={20}
                    width={48}
                    className="react-switch"
                />
            </div>
            {/* VM 모드에 필요한 추가적인 컴포넌트나 메뉴를 여기에 추가하세요 */}
        </div>
    );
};

export default VMSidebar;
