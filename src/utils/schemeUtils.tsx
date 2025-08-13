import { LockOutlined, UserOutlined, AppstoreOutlined } from '@ant-design/icons';
import type { ReactElement } from 'react';

export const getSchemeIcon = (schemeType: string): ReactElement => {
    switch (schemeType) {
        case 'Application':
            return <AppstoreOutlined />;
        case 'DelegatedWork':
            return <UserOutlined />;
        case 'DelegatedPersonal':
            return <UserOutlined />;
        default:
            return <LockOutlined />;
    }
};

export const getSchemeColor = (schemeType: string): string => {
    switch (schemeType) {
        case 'Application':
            return '#722ed1';
        case 'DelegatedWork':
            return '#1890ff';
        case 'DelegatedPersonal':
            return '#fa8c16';
        default:
            return '#1890ff';
    }
};