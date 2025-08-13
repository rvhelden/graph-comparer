import { useState, useMemo } from 'react';
import { List, Typography, Badge, Collapse } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import type { Permission } from '../hooks/usePermissions';
import { COMMON_PERMISSIONS } from '../constants/permissions';
import { PermissionItem } from './PermissionItem';
import { PermissionsListHeader } from './PermissionsListHeader';
import type { EndpointFilter } from '../types/filter';

const { Text } = Typography;
const { Panel } = Collapse;

interface PermissionsListProps {
    permissions: Permission[];
    descriptions: import('../hooks/usePermissions').PermissionDescription[];
    selectedPermission: string | null;
    onPermissionSelect: (permissionName: string) => void;
    isLoading: boolean;
    comparisonMode?: boolean;
    selectedForComparison?: string[];
    onComparisonToggle?: (permissionName: string) => void;
    onComparisonModeToggle?: () => void;
    endpointFilter?: EndpointFilter;
    onEndpointFilterChange?: (filter: EndpointFilter | undefined) => void;
    hideDisabled?: boolean;
}

export const PermissionsList = ({
    permissions,
    descriptions,
    selectedPermission,
    onPermissionSelect,
    isLoading,
    comparisonMode = false,
    selectedForComparison = [],
    onComparisonToggle,
    onComparisonModeToggle,
    endpointFilter,
    onEndpointFilterChange,
    hideDisabled = true
}: PermissionsListProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showRscOnly, setShowRscOnly] = useState(false);

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

        permissions.forEach((permission) => {
            const searchableTerms = new Set<string>();

            // Add permission name
            searchableTerms.add(permission.name.toLowerCase());

            // Add scheme descriptions
            Object.values(permission.schemes).forEach((scheme) => {
                if (scheme?.adminDisplayName) {
                    searchableTerms.add(scheme.adminDisplayName.toLowerCase());
                }
                if (scheme?.adminDescription) {
                    searchableTerms.add(scheme.adminDescription.toLowerCase());
                }
            });

            // Add all API paths
            permission.pathSets.forEach((pathSet) => {
                Object.keys(pathSet.paths).forEach((path) => {
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
            filtered = filtered.filter((permission) => {
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

        // Apply endpoint filter (method + path)
        if (endpointFilter) {
            filtered = filtered.filter((permission) => {
                return permission.pathSets.some((pathSet) => {
                    const pathMatches =
                        !endpointFilter.path || Object.keys(pathSet.paths).some((path) => path.toLowerCase() === endpointFilter.path!.toLowerCase());
                    const methodMatches =
                        !endpointFilter.method || pathSet.methods.some((method) => method.toLowerCase() === endpointFilter.method!.toLowerCase());
                    return pathMatches && methodMatches;
                });
            });
        }

        // Apply RSC filter
        if (showRscOnly) {
            filtered = filtered.filter((permission) => permission.authorizationType === 'RSC');
        }

        // Apply enabled/disabled filter
        if (hideDisabled) {
            filtered = filtered.filter((permission) => {
                const description = descriptions.find((desc) => desc.value === permission.name);
                return description ? description.isEnabled !== false : true; // Show if no description found or explicitly enabled
            });
        }

        return filtered;
    }, [permissions, searchTerm, searchIndex, endpointFilter, showRscOnly, hideDisabled, descriptions]);

    // Group permissions by first part of permission name
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};

        // Add favorites group if there are any favorites
        const favoritePermissions = filteredPermissions.filter((p) => favorites.has(p.name));
        if (favoritePermissions.length > 0) {
            groups['⭐ Favorites'] = favoritePermissions;
        }

        // Add common permissions group (always visible)
        const commonPermissions = filteredPermissions.filter((p) => COMMON_PERMISSIONS.includes(p.name));
        if (commonPermissions.length > 0) {
            groups['🔥 Common Permissions'] = commonPermissions;
        }

        filteredPermissions.forEach((permission) => {
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

    const getLowestPrivilegeLevel = (permission: Permission) => {
        const levels = Object.values(permission.schemes)
            .filter((scheme) => scheme?.privilegeLevel)
            .map((scheme) => scheme!.privilegeLevel);

        return levels.length > 0 ? Math.min(...levels) : 0;
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#252423FF' }}>
            <PermissionsListHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                endpointFilter={endpointFilter}
                showRscOnly={showRscOnly}
                onShowRscOnlyChange={setShowRscOnly}
                comparisonMode={comparisonMode}
                onComparisonModeToggle={onComparisonModeToggle}
                onEndpointFilterChange={onEndpointFilterChange}
            />

            <div style={{ flex: 1, overflow: 'auto', minHeight: 0, maxHeight: '100%' }}>
                {isLoading ? (
                    <List loading={true} />
                ) : (
                    <Collapse ghost defaultActiveKey={[]} style={{ backgroundColor: 'transparent', overflow: 'visible' }}>
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
                                            <PermissionItem
                                                permission={permission}
                                                descriptions={descriptions}
                                                selectedPermission={selectedPermission}
                                                selectedForComparison={selectedForComparison}
                                                comparisonMode={comparisonMode}
                                                favorites={favorites}
                                                onPermissionSelect={onPermissionSelect}
                                                onComparisonToggle={onComparisonToggle}
                                                onToggleFavorite={toggleFavorite}
                                                getLowestPrivilegeLevel={getLowestPrivilegeLevel}
                                            />
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
