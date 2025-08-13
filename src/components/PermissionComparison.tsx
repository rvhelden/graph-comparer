import { Card, Typography, Table, Tag, Alert, Button, Switch } from 'antd';
import { ApiOutlined, LockOutlined, UserOutlined, AppstoreOutlined, CloseOutlined, FilterOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { Permission, PermissionDescription } from '../hooks/usePermissions';

const { Title, Text } = Typography;

interface EndpointData {
    key: string;
    method: string;
    path: string;
    permissions: Array<{
        name: string;
        schemes: string[];
        hasAccess: boolean;
    }>;
}

interface PermissionComparisonProps {
    selectedPermissions: Permission[];
    descriptions: PermissionDescription[];
    onRemovePermission: (permissionName: string) => void;
    onUrlFilter: (url: string) => void;
}

export const PermissionComparison = ({ selectedPermissions, descriptions, onRemovePermission, onUrlFilter }: PermissionComparisonProps) => {
    const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
    const getSchemeIcon = (schemeType: string) => {
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

    const getSchemeColor = (schemeType: string) => {
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

    const getPrivilegeLevelColor = (level: number) => {
        if (level <= 1) return '#1890ff';
        if (level <= 2) return '#faad14';
        if (level <= 3) return '#fa8c16';
        return '#f5222d';
    };

    // Component to render privilege level as colored rectangles
    const PrivilegeLevelIndicator = ({ level }: { level: number }) => {
        const rectangles = [];
        for (let i = 1; i <= 5; i++) {
            const isActive = i <= level;
            rectangles.push(
                <div
                    key={i}
                    style={{
                        width: '6px',
                        height: '10px',
                        backgroundColor: isActive ? getPrivilegeLevelColor(level) : '#333333',
                        border: '1px solid #555555',
                        display: 'inline-block',
                        marginRight: i < 5 ? '1px' : '0'
                    }}
                />
            );
        }
        return (
            <div style={{ display: 'flex', alignItems: 'center' }} title={`Privilege Level ${level}/5`}>
                {rectangles}
            </div>
        );
    };

    // Collect all unique endpoints from all selected permissions
    const getAllEndpoints = () => {
        const endpointMap = new Map<string, EndpointData>();

        selectedPermissions.forEach((permission) => {
            permission.pathSets.forEach((pathSet) => {
                Object.entries(pathSet.paths).forEach(([path]) => {
                    pathSet.methods.forEach((method) => {
                        const endpointKey = `${method}:${path}`;

                        if (!endpointMap.has(endpointKey)) {
                            endpointMap.set(endpointKey, {
                                key: endpointKey,
                                method,
                                path,
                                permissions: selectedPermissions.map((p) => ({
                                    name: p.name,
                                    schemes: [],
                                    hasAccess: false
                                }))
                            });
                        }

                        const endpoint = endpointMap.get(endpointKey);
                        const permissionIndex = endpoint?.permissions.findIndex((p) => p.name === permission.name) ?? -1;
                        if (permissionIndex >= 0 && endpoint) {
                            endpoint.permissions[permissionIndex].schemes = pathSet.schemeKeys;
                            endpoint.permissions[permissionIndex].hasAccess = true;
                        }
                    });
                });
            });
        });

        return Array.from(endpointMap.values());
    };

    const allEndpoints = getAllEndpoints();

    // Function to check if an endpoint has differences between permissions
    const hasAccessDifferences = (endpoint: EndpointData) => {
        const accessStates = endpoint.permissions.map((p) => p.hasAccess);
        // If all permissions have the same access state (all true or all false), no difference
        const allSame = accessStates.every((state) => state === accessStates[0]);
        return !allSame;
    };

    // Filter endpoints based on differences filter
    const endpoints = showDifferencesOnly ? allEndpoints.filter(hasAccessDifferences) : allEndpoints;

    // Create columns for the comparison table
    const columns = [
        {
            title: 'Method',
            dataIndex: 'method',
            key: 'method',
            width: 80,
            render: (method: string) => <Tag color={method === 'GET' ? 'blue' : method === 'POST' ? 'green' : 'orange'}>{method}</Tag>
        },
        {
            title: 'Endpoint',
            dataIndex: 'path',
            key: 'path',
            render: (path: string) => (
                <Text style={{ cursor: 'pointer' }} onClick={() => onUrlFilter(path)} title='Click to filter permissions by this URL prefix'>
                    {path}
                </Text>
            )
        },
        ...selectedPermissions.map((permission) => ({
            title: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text strong style={{ fontSize: '11px' }}>
                        {permission.name}
                    </Text>
                    <Button
                        type='text'
                        size='small'
                        icon={<CloseOutlined />}
                        onClick={() => onRemovePermission(permission.name)}
                        style={{ minWidth: 'auto', padding: '0 4px' }}
                    />
                </div>
            ),
            dataIndex: 'permissions',
            key: permission.name,
            width: 150,
            render: (permissions: Array<{ name: string; schemes: string[]; hasAccess: boolean }>) => {
                const permData = permissions.find((p) => p.name === permission.name);
                if (!permData?.hasAccess) {
                    return <Text type='secondary'>No Access</Text>;
                }

                return (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {permData.schemes.map((scheme: string) => (
                            <span
                                key={scheme}
                                title={scheme}
                                style={{
                                    color: getSchemeColor(scheme),
                                    fontSize: '14px',
                                    cursor: 'help'
                                }}
                            >
                                {getSchemeIcon(scheme)}
                            </span>
                        ))}
                    </div>
                );
            }
        }))
    ];

    if (selectedPermissions.length === 0) {
        return (
            <div
                style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}
            >
                <Alert
                    message='No Permissions Selected'
                    description='Select permissions from the list to compare their capabilities'
                    type='info'
                    showIcon
                />
            </div>
        );
    }

    return (
        <div
            style={{
                height: '100%',
                overflow: 'auto',
                padding: '24px',
                backgroundColor: '#1B1A19FF'
            }}
        >
            <Title level={2} style={{ color: '#50AF5BFF', marginBottom: '24px' }}>
                <ApiOutlined style={{ marginRight: '8px' }} />
                Permission Comparison ({selectedPermissions.length})
            </Title>

            {/* Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {selectedPermissions.map((permission) => {
                    const description = descriptions.find((desc) => desc.value === permission.name);
                    const minPrivilegeLevel = Math.min(
                        ...Object.values(permission.schemes)
                            .filter((scheme) => scheme?.privilegeLevel)
                            .map((scheme) => scheme!.privilegeLevel)
                    );

                    return (
                        <Card
                            key={permission.name}
                            size='small'
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text strong style={{ fontSize: '14px' }}>
                                        {permission.name}
                                    </Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <PrivilegeLevelIndicator level={minPrivilegeLevel} />
                                        <Button type='text' size='small' icon={<CloseOutlined />} onClick={() => onRemovePermission(permission.name)} />
                                    </div>
                                </div>
                            }
                        >
                            <Text type='secondary' style={{ fontSize: '12px' }}>
                                {description?.adminConsentDisplayName || 'No description available'}
                            </Text>
                            <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {Object.keys(permission.schemes).map((schemeType) => (
                                    <Tag key={schemeType} color={getSchemeColor(schemeType)} style={{ fontSize: '10px' }}>
                                        {schemeType}
                                    </Tag>
                                ))}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Comparison Table */}
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{`API Endpoint Comparison (${endpoints.length} endpoints)`}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FilterOutlined style={{ color: '#1890ff' }} />
                            <Text style={{ fontSize: '12px' }}>Show differences only:</Text>
                            <Switch size='small' checked={showDifferencesOnly} onChange={setShowDifferencesOnly} />
                        </div>
                    </div>
                }
            >
                <Table columns={columns} dataSource={endpoints} pagination={false} scroll={{ x: true }} size='small' />
            </Card>
        </div>
    );
};
