import { useState, useEffect } from 'react';

export interface PermissionScheme {
    adminDisplayName: string;
    adminDescription: string;
    userDisplayName?: string;
    userDescription?: string;
    requiresAdminConsent: boolean;
    privilegeLevel: number;
}

export interface PermissionPathSet {
    schemeKeys: string[];
    methods: string[];
    paths: Record<string, string>;
}

export interface Permission {
    name: string;
    authorizationType: string;
    schemes: {
        DelegatedWork?: PermissionScheme;
        DelegatedPersonal?: PermissionScheme;
        Application?: PermissionScheme;
    };
    pathSets: PermissionPathSet[];
}

export interface PermissionDescription {
    adminConsentDescription: string;
    adminConsentDisplayName: string;
    consentDescription: string;
    consentDisplayName: string;
    id: string;
    isAdmin: boolean;
    isEnabled: boolean;
    value: string;
}

export interface PermissionsData {
    permissions: Permission[];
    descriptions: PermissionDescription[];
    isLoading: boolean;
    error: string | null;
}

export const usePermissions = (): PermissionsData => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [descriptions, setDescriptions] = useState<PermissionDescription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPermissions = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Load permissions.json
                const permissionsResponse = await fetch(
                    'https://raw.githubusercontent.com/microsoftgraph/microsoft-graph-devx-content/refs/heads/master/permissions/new/permissions.json'
                );
                if (!permissionsResponse.ok) {
                    throw new Error(`Failed to load permissions data: ${permissionsResponse.status} ${permissionsResponse.statusText}`);
                }
                const permissionsData = await permissionsResponse.json();

                // Transform the permissions data structure
                const transformedPermissions: Permission[] = Object.entries(permissionsData.permissions || {}).map(([name, data]: [string, unknown]) => {
                    const permissionData = data as {
                        authorizationType: string;
                        schemes: Record<string, PermissionScheme>;
                        pathSets?: PermissionPathSet[];
                    };

                    return {
                        name,
                        authorizationType: permissionData.authorizationType,
                        schemes: permissionData.schemes,
                        pathSets: permissionData.pathSets || []
                    };
                });

                // Load permissions-descriptions.json
                const descriptionsResponse = await fetch(
                    'https://raw.githubusercontent.com/microsoftgraph/microsoft-graph-devx-content/dev/permissions/permissions-descriptions.json'
                );
                if (!descriptionsResponse.ok) {
                    throw new Error('Failed to load permissions descriptions');
                }
                const descriptionsData = await descriptionsResponse.json();

                setPermissions(transformedPermissions);
                setDescriptions(descriptionsData.delegatedScopesList || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        loadPermissions();
    }, []);

    return {
        permissions,
        descriptions,
        isLoading,
        error
    };
};
