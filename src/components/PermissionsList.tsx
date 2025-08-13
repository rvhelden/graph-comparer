import { useState, useMemo } from 'react';
import { Input, List, Typography, Checkbox, Button, Badge, Collapse } from 'antd';
import { SearchOutlined, SwapOutlined, ClearOutlined, FolderOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import type { Permission } from '../hooks/usePermissions';

const { Search } = Input;
const { Text } = Typography;
const { Panel } = Collapse;

// Most commonly used Microsoft Graph permissions
const COMMON_PERMISSIONS = [
    'User.Read',
    'User.ReadWrite',
    'User.Read.All',
    'User.ReadWrite.All',
    'Directory.Read.All',
    'Directory.ReadWrite.All',
    'Group.Read.All',
    'Group.ReadWrite.All',
    'Mail.Read',
    'Mail.ReadWrite',
    'Mail.Send',
    'Calendars.Read',
    'Calendars.ReadWrite',
    'Files.Read',
    'Files.ReadWrite',
    'Files.Read.All',
    'Files.ReadWrite.All',
    'Sites.Read.All',
    'Sites.ReadWrite.All',
    'People.Read',
    'People.Read.All',
    'Contacts.Read',
    'Contacts.ReadWrite',
    'Tasks.Read',
    'Tasks.ReadWrite',
    'Notes.Read',
    'Notes.ReadWrite',
    'Application.Read.All',
    'Application.ReadWrite.All',
    'AppRoleAssignment.ReadWrite.All',
    'RoleManagement.Read.All',
    'RoleManagement.ReadWrite.All'
];

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
    urlFilter?: string;
    onUrlFilterChange?: (urlFilter: string | undefined) => void;
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
    onClearComparison,
    urlFilter,
    onUrlFilterChange
}: PermissionsListProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Load favorites from localStorage
    const [favorites, setFavorites] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('graph-permissions-favorites');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    // Save favorites to localStorage when it changes
    const toggleFavorite = (permissionName: string) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(permissionName)) {
            newFavorites.delete(permissionName);
        } else {
            newFavorites.add(permissionName);
        }
        setFavorites(newFavorites);
        localStorage.setItem('graph-permissions-favorites', JSON.stringify([...newFavorites]));
    };

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
        let filtered = permissions;

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(permission => {
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
        }

        // Apply URL filter
        if (urlFilter) {
            filtered = filtered.filter(permission => {
                return permission.pathSets.some(pathSet => 
                    Object.keys(pathSet.paths).some(path => 
                        path.toLowerCase().includes(urlFilter.toLowerCase())
                    )
                );
            });
        }

        return filtered;
    }, [permissions, searchTerm, searchIndex, urlFilter]);

    // Group permissions by first part of permission name
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        
        // Add favorites group if there are any favorites
        const favoritePermissions = filteredPermissions.filter(p => favorites.has(p.name));
        if (favoritePermissions.length > 0) {
            groups['⭐ Favorites'] = favoritePermissions;
        }

        // Add common permissions group (always visible)
        const commonPermissions = filteredPermissions.filter(p => COMMON_PERMISSIONS.includes(p.name));
        if (commonPermissions.length > 0) {
            groups['🔥 Common Permissions'] = commonPermissions;
        }
        
        filteredPermissions.forEach(permission => {
            // Split by dot and take the first part
            const parts = permission.name.split('.');
            const prefix = parts[0] || 'Other';
            
            if (!groups[prefix]) {
                groups[prefix] = [];
            }
            groups[prefix].push(permission);
        });
        
        return groups;
    }, [filteredPermissions, favorites]);

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
                        {urlFilter && <Text type='warning'> (filtered by: /{urlFilter})</Text>}
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
                        {urlFilter && (
                            <Button
                                size="small"
                                icon={<ClearOutlined />}
                                onClick={() => onUrlFilterChange?.(undefined)}
                            >
                                Clear Filter
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', minHeight: 0, maxHeight: '100%' }}>
                {isLoading ? (
                    <List loading={true} />
                ) : (
                    <Collapse
                        ghost
                        defaultActiveKey={[]}
                        style={{ backgroundColor: 'transparent', overflow: 'visible' }}
                    >
                        {Object.entries(groupedPermissions)
                            .sort(([a], [b]) => {
                                // Sort special groups to the top
                                if (a === '⭐ Favorites') return -1;
                                if (b === '⭐ Favorites') return 1;
                                if (a === '🔥 Common Permissions') return -1;
                                if (b === '🔥 Common Permissions') return 1;
                                return a.localeCompare(b);
                            })
                            .map(([groupName, groupPermissions]) => (
                                <Panel
                                    key={groupName}
                                    header={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FolderOutlined style={{ color: '#50AF5BFF' }} />
                                            <Text strong style={{ color: '#50AF5BFF' }}>
                                                {groupName}
                                            </Text>
                                            <Badge count={groupPermissions.length} style={{ backgroundColor: '#326c39' }} />
                                        </div>
                                    }
                                    style={{ backgroundColor: 'transparent', border: 'none' }}
                                >
                                    <List
                                        dataSource={groupPermissions}
                                        size='small'
                                        pagination={false}
                                        renderItem={(permission) => (
                                            <List.Item
                                                style={{
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    backgroundColor: selectedPermission === permission.name ? 'rgba(50, 108, 57, 0.2)' : 
                                                                    selectedForComparison.includes(permission.name) ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
                                                    borderLeft: selectedPermission === permission.name ? '3px solid #326c39' : 
                                                               selectedForComparison.includes(permission.name) ? '3px solid #1890ff' : '3px solid transparent',
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
                                                                <Text strong style={{ color: '#50AF5BFF', fontSize: '13px' }}>
                                                                    {permission.name}
                                                                </Text>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={favorites.has(permission.name) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleFavorite(permission.name);
                                                                    }}
                                                                    style={{ 
                                                                        border: 'none', 
                                                                        padding: '0', 
                                                                        minWidth: 'auto',
                                                                        height: 'auto',
                                                                        lineHeight: 1
                                                                    }}
                                                                />
                                                                {getHighestPrivilegeLevel(permission) > 0 && (
                                                                    <PrivilegeLevelIndicator level={getHighestPrivilegeLevel(permission)} />
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
                                        )}
                                    />
                                </Panel>
                            ))}
                    </Collapse>
                )}
            </div>
        </div>
    );
};
