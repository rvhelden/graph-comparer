import { useState, useMemo } from 'react';
import { Input, List, Typography, Checkbox, Button, Badge } from 'antd';
import { SearchOutlined, SwapOutlined, ClearOutlined } from '@ant-design/icons';
import type { Permission } from '../hooks/usePermissions';

const { Search } = Input;
const { Text } = Typography;

interface PermissionsListProps {
    permissions: Permission[];
    selectedPermission: string | null;
    onPermissionSelect: (permissionName: string) => void;
    isLoading: boolean;
    comparisonMode?: boolean;
    selectedForComparison?: string[];
    onComparisonToggle?: (permissionName: string) => void;
    onComparisonModeToggle?: () => void;
    onClearComparison?: () => void;
}

export const PermissionsList = ({ 
    permissions, 
    selectedPermission, 
    onPermissionSelect, 
    isLoading,
    comparisonMode = false,
    selectedForComparison = [],
    onComparisonToggle,
    onComparisonModeToggle,
    onClearComparison
}: PermissionsListProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Pre-compute search index for fast lookups
    const searchIndex = useMemo(() => {
        const index = new Map<string, Set<string>>();
        
        permissions.forEach(permission => {
            const searchableTerms = new Set<string>();
            
            // Add permission name
            searchableTerms.add(permission.name.toLowerCase());
            
            // Add scheme descriptions
            Object.values(permission.schemes).forEach(scheme => {
                if (scheme?.adminDisplayName) {
                    searchableTerms.add(scheme.adminDisplayName.toLowerCase());
                }
                if (scheme?.adminDescription) {
                    searchableTerms.add(scheme.adminDescription.toLowerCase());
                }
            });
            
            // Add all API paths
            permission.pathSets.forEach(pathSet => {
                Object.keys(pathSet.paths).forEach(path => {
                    searchableTerms.add(path.toLowerCase());
                });
            });
            
            index.set(permission.name, searchableTerms);
        });
        
        return index;
    }, [permissions]);

    const filteredPermissions = useMemo(() => {
        if (!searchTerm) return permissions;

        const searchLower = searchTerm.toLowerCase();
        return permissions.filter(permission => {
            const permissionTerms = searchIndex.get(permission.name);
            if (!permissionTerms) return false;
            
            // Check if any searchable term contains the search string
            for (const term of permissionTerms) {
                if (term.includes(searchLower)) {
                    return true;
                }
            }
            return false;
        });
    }, [permissions, searchTerm, searchIndex]);

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
                    placeholder='Search permissions & URLs...'
                    allowClear
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    prefix={<SearchOutlined />}
                    style={{ marginBottom: '8px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <Text type='secondary'>
                        {filteredPermissions.length} of {permissions.length} permissions
                    </Text>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                            type={comparisonMode ? 'primary' : 'default'}
                            size="small"
                            icon={<SwapOutlined />}
                            onClick={onComparisonModeToggle}
                        >
                            Compare
                            {selectedForComparison.length > 0 && (
                                <Badge count={selectedForComparison.length} style={{ marginLeft: '4px' }} />
                            )}
                        </Button>
                        {selectedForComparison.length > 0 && (
                            <Button
                                size="small"
                                icon={<ClearOutlined />}
                                onClick={onClearComparison}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
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
                                backgroundColor: selectedPermission === permission.name ? 'rgba(50, 108, 57, 0.2)' : 
                                                selectedForComparison.includes(permission.name) ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
                                borderLeft: selectedPermission === permission.name ? '3px solid #326c39' : 
                                           selectedForComparison.includes(permission.name) ? '3px solid #1890ff' : '3px solid transparent',
                                borderBottom: '1px solid #303030'
                            }}
                            onClick={(e) => {
                                if (comparisonMode && e.target !== e.currentTarget) return; // Prevent click when clicking checkbox
                                if (!comparisonMode) {
                                    onPermissionSelect(permission.name);
                                }
                            }}
                        >
                            <List.Item.Meta
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
                                            <Text strong style={{ color: '#50AF5BFF' }}>
                                                {permission.name}
                                            </Text>
                                        </div>
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
