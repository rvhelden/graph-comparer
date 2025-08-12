import { useState, useMemo } from 'react';
import { Input, List, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { Permission } from '../hooks/usePermissions';

const { Search } = Input;
const { Text } = Typography;

interface PermissionsListProps {
    permissions: Permission[];
    selectedPermission: string | null;
    onPermissionSelect: (permissionName: string) => void;
    isLoading: boolean;
}

export const PermissionsList = ({ permissions, selectedPermission, onPermissionSelect, isLoading }: PermissionsListProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPermissions = useMemo(() => {
        if (!searchTerm) return permissions;

        const searchLower = searchTerm.toLowerCase();
        return permissions.filter(
            (permission) =>
                permission.name.toLowerCase().includes(searchLower) ||
                Object.values(permission.schemes).some(
                    (scheme) =>
                        scheme?.adminDisplayName?.toLowerCase().includes(searchLower) || scheme?.adminDescription?.toLowerCase().includes(searchLower)
                )
        );
    }, [permissions, searchTerm]);

    const getHighestPrivilegeLevel = (permission: Permission) => {
        const levels = Object.values(permission.schemes)
            .filter((scheme) => scheme?.privilegeLevel)
            .map((scheme) => scheme!.privilegeLevel);

        return levels.length > 0 ? Math.max(...levels) : 0;
    };

    const getPrivilegeLevelColor = (level: number) => {
        if (level <= 1) return '#1890ff';
        if (level <= 2) return '#faad14';
        if (level <= 3) return '#fa8c16';
        return '#f5222d';
    };

    // Component to render privilege level as colored rectangles (smaller for list)
    const PrivilegeLevelIndicator = ({ level }: { level: number }) => {
        const rectangles = [];
        for (let i = 1; i <= 5; i++) {
            const isActive = i <= level;
            rectangles.push(
                <div
                    key={i}
                    style={{
                        width: '6px',
                        height: '8px',
                        backgroundColor: isActive ? getPrivilegeLevelColor(level) : '#333333',
                        border: '1px solid #555555',
                        display: 'inline-block',
                        marginRight: i < 5 ? '1px' : '0'
                    }}
                />
            );
        }
        return (
            <div 
                style={{ display: 'flex', alignItems: 'center' }}
                title={`Privilege Level ${level}/5`}
            >
                {rectangles}
            </div>
        );
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#252423FF' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #303030', flexShrink: 0 }}>
                <Search
                    placeholder='Search permissions...'
                    allowClear
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    prefix={<SearchOutlined />}
                    style={{ marginBottom: '8px' }}
                />
                <Text type='secondary'>
                    {filteredPermissions.length} of {permissions.length} permissions
                </Text>
            </div>

            <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                <List
                    loading={isLoading}
                    dataSource={filteredPermissions}
                    size='small'
                    pagination={false}
                    renderItem={(permission) => (
                        <List.Item
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                backgroundColor: selectedPermission === permission.name ? 'rgba(50, 108, 57, 0.2)' : 'transparent',
                                borderLeft: selectedPermission === permission.name ? '3px solid #326c39' : '3px solid transparent',
                                borderBottom: '1px solid #303030'
                            }}
                            onClick={() => onPermissionSelect(permission.name)}
                        >
                            <List.Item.Meta
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <Text strong style={{ color: '#50AF5BFF' }}>
                                            {permission.name}
                                        </Text>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {getHighestPrivilegeLevel(permission) > 0 && (
                                                <PrivilegeLevelIndicator level={getHighestPrivilegeLevel(permission)} />
                                            )}
                                        </div>
                                    </div>
                                }
                                description={
                                    <Text type='secondary' style={{ fontSize: '12px' }}>
                                        {permission.schemes.DelegatedWork?.adminDisplayName ||
                                            permission.schemes.Application?.adminDisplayName ||
                                            'No description available'}
                                    </Text>
                                }
                            />
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );
};
