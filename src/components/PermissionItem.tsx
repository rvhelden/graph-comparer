import { List, Typography, Checkbox, Button, Tag } from 'antd';
import { StarOutlined, StarFilled, TeamOutlined } from '@ant-design/icons';
import type { Permission, PermissionDescription } from '../hooks/usePermissions';
import { PrivilegeLevelIndicator } from './PrivilegeLevelIndicator';

const { Text } = Typography;

interface PermissionItemProps {
    permission: Permission;
    descriptions: PermissionDescription[];
    selectedPermission: string | null;
    selectedForComparison: string[];
    comparisonMode: boolean;
    favorites: Set<string>;
    onPermissionSelect: (permissionName: string) => void;
    onComparisonToggle?: (permissionName: string) => void;
    onToggleFavorite: (permissionName: string) => void;
    getLowestPrivilegeLevel: (permission: Permission) => number;
}

export const PermissionItem = ({
    permission,
    descriptions,
    selectedPermission,
    selectedForComparison,
    comparisonMode,
    favorites,
    onPermissionSelect,
    onComparisonToggle,
    onToggleFavorite,
    getLowestPrivilegeLevel
}: PermissionItemProps) => {
    return (
        <List.Item
            style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor:
                    selectedPermission === permission.name
                        ? 'rgba(50, 108, 57, 0.2)'
                        : selectedForComparison.includes(permission.name)
                          ? 'rgba(24, 144, 255, 0.1)'
                          : 'transparent',
                borderLeft:
                    selectedPermission === permission.name
                        ? '3px solid #326c39'
                        : selectedForComparison.includes(permission.name)
                          ? '3px solid #1890ff'
                          : '3px solid transparent',
                borderBottom: '1px solid #333',
                marginLeft: '16px'
            }}
            onClick={(e) => {
                if (comparisonMode && e.target !== e.currentTarget) return;
                if (!comparisonMode) {
                    onPermissionSelect(permission.name);
                }
            }}
        >
            <List.Item.Meta
                title={
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            {comparisonMode && (
                                <Checkbox
                                    checked={selectedForComparison.includes(permission.name)}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        onComparisonToggle?.(permission.name);
                                    }}
                                />
                            )}
                            <Text strong style={{ color: '#50AF5BFF', fontSize: '13px' }}>
                                {permission.name}
                            </Text>
                            {permission.authorizationType === 'RSC' && (
                                <Tag
                                    icon={<TeamOutlined />}
                                    color='blue'
                                    style={{ fontSize: '10px', lineHeight: 1.2, padding: '0 4px' }}
                                >
                                    RSC
                                </Tag>
                            )}
                            {(() => {
                                const description = descriptions.find((desc) => desc.value === permission.name);
                                return description && description.isEnabled === false ? (
                                    <Tag color='red' style={{ fontSize: '10px', lineHeight: 1.2, padding: '0 4px' }}>
                                        DISABLED
                                    </Tag>
                                ) : null;
                            })()}
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <Button
                                type='text'
                                size='small'
                                icon={
                                    favorites.has(permission.name) ? (
                                        <StarFilled style={{ color: '#faad14' }} />
                                    ) : (
                                        <StarOutlined />
                                    )
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(permission.name);
                                }}
                                style={{
                                    border: 'none',
                                    padding: '0',
                                    minWidth: 'auto',
                                    height: 'auto',
                                    lineHeight: 1
                                }}
                            />
                            {getLowestPrivilegeLevel(permission) > 0 && (
                                <PrivilegeLevelIndicator level={getLowestPrivilegeLevel(permission)} size="small" />
                            )}
                        </div>
                    </div>
                }
                description={
                    <Text type='secondary' style={{ fontSize: '11px' }}>
                        {permission.schemes.DelegatedWork?.adminDisplayName ||
                            permission.schemes.Application?.adminDisplayName ||
                            'No description available'}
                    </Text>
                }
            />
        </List.Item>
    );
};