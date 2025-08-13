import { MessageOutlined, UsergroupAddOutlined, UserOutlined } from '@ant-design/icons';
import type { ReactElement } from 'react';

export interface RscScopeInfo {
    scope: string;
    icon: ReactElement;
    description: string;
    color: string;
}

// Function to get RSC scope information
export const getRscScopeInfo = (permissionName: string): RscScopeInfo | null => {
    if (permissionName.endsWith('.Chat')) {
        return {
            scope: 'Chat',
            icon: <MessageOutlined />,
            description: 'Resource-specific consent for individual chats and meetings',
            color: '#1890ff'
        };
    } else if (permissionName.endsWith('.Group')) {
        return {
            scope: 'Team/Group',
            icon: <UsergroupAddOutlined />,
            description: 'Resource-specific consent for individual teams and groups',
            color: '#285f0d'
        };
    } else if (permissionName.endsWith('.User')) {
        return {
            scope: 'User',
            icon: <UserOutlined />,
            description: 'Resource-specific consent for individual users',
            color: '#fa8c16'
        };
    }
    return null;
};