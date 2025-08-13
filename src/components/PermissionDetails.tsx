import { Card, Typography, Descriptions, Tag, Table, Collapse, Empty, Tabs, Select, Switch, Button } from 'antd';
import { ApiOutlined, LockOutlined, UserOutlined, AppstoreOutlined, LinkOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { Permission, PermissionDescription } from '../hooks/usePermissions';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface ApiEndpoint {
    key: string;
    method: string;
    path: string;
    config: string;
    schemes: string[];
}

interface PermissionDetailsProps {
    permission: Permission | null;
    descriptions: PermissionDescription[];
    onUrlFilter?: (urlPrefix: string) => void;
    apiVersion?: 'v1.0' | 'beta';
    onApiVersionChange?: (version: 'v1.0' | 'beta') => void;
}

// Component for individual endpoint tab with method filtering
const EndpointTable = ({
    endpoints,
    apiColumns
}: {
    endpoints: ApiEndpoint[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiColumns: any[];
}) => {
    const [methodFilter, setMethodFilter] = useState<string | undefined>(undefined);

    // Get unique methods for this tab
    const availableMethods = [...new Set(endpoints.map((e) => e.method))].sort();

    // Filter endpoints by selected method
    const filteredEndpoints = methodFilter ? endpoints.filter((e) => e.method === methodFilter) : endpoints;

    return (
        <div>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text>Filter by method:</Text>
                <Select placeholder='All methods' value={methodFilter} onChange={setMethodFilter} allowClear style={{ minWidth: 120 }}>
                    {availableMethods.map((method) => (
                        <Select.Option key={method} value={method}>
                            <Tag color={method === 'GET' ? 'blue' : method === 'POST' ? 'green' : 'orange'} style={{ margin: 0 }}>
                                {method}
                            </Tag>
                        </Select.Option>
                    ))}
                </Select>
                <Text type='secondary'>
                    {filteredEndpoints.length} of {endpoints.length} endpoints
                </Text>
            </div>
            <Table columns={apiColumns} dataSource={filteredEndpoints} pagination={false} scroll={{ x: true }} size='small' />
        </div>
    );
};

export const PermissionDetails = ({ permission, descriptions, onUrlFilter, apiVersion = 'v1.0', onApiVersionChange }: PermissionDetailsProps) => {
    if (!permission) {
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
                <Empty description='Select a permission to view details' image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
        );
    }

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
                        width: '8px',
                        height: '12px',
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

    // Find matching description from the descriptions array
    const matchingDescription = descriptions.find((desc) => desc.value === permission.name);

    // Prepare API endpoints data for table

    const apiEndpoints: ApiEndpoint[] = [];
    permission.pathSets.forEach((pathSet, pathSetIndex) => {
        Object.entries(pathSet.paths).forEach(([path, config]) => {
            pathSet.methods.forEach((method) => {
                apiEndpoints.push({
                    key: `${pathSetIndex}-${path}-${method}`,
                    method,
                    path,
                    config,
                    schemes: pathSet.schemeKeys
                });
            });
        });
    });

    // Group endpoints by first path segment
    const groupedEndpoints = apiEndpoints.reduce(
        (groups, endpoint) => {
            const pathParts = endpoint.path.split('/').filter((part) => part);
            const firstPart = pathParts[0] || 'root';

            if (!groups[firstPart]) {
                groups[firstPart] = [];
            }
            groups[firstPart].push(endpoint);
            return groups;
        },
        {} as Record<string, ApiEndpoint[]>
    );

    const apiColumns = [
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
            render: (path: string, record: ApiEndpoint) => {
                const handleUrlClick = () => {
                    const segments = path.split('/').filter((segment) => segment);
                    if (segments.length > 0 && onUrlFilter) {
                        onUrlFilter(segments[0]);
                    }
                };

                const getEndpointDocUrl = (path: string, method: string, version: string) => {
                    const cleanPath = path.replace(/\{[^}]+\}/g, '').replace(/\/+$/, '');
                    const segments = cleanPath.split('/').filter(s => s);
                    
                    if (segments.length === 0) return null;
                    
                    const resource = segments[0];
                    
                    // Handle different endpoint patterns
                    if (segments.length === 1) {
                        // Root resource endpoints like /users, /groups, etc.
                        if (method === 'GET') {
                            return `https://learn.microsoft.com/en-us/graph/api/${resource}-list?view=graph-rest-${version}`;
                        } else if (method === 'POST') {
                            // Convert plural to singular for POST operations
                            const singular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
                            return `https://learn.microsoft.com/en-us/graph/api/${singular}-post-${resource}?view=graph-rest-${version}`;
                        }
                    } else if (segments.length === 2) {
                        // Two-segment paths like /users/{id}, /users/delta, /groups/{id}/members
                        const action = segments[1];
                        
                        if (method === 'GET') {
                            // Convert plural to singular for the resource name in URL
                            const singular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
                            
                            // Special cases for common actions
                            if (action === 'delta') {
                                return `https://learn.microsoft.com/en-us/graph/api/${singular}-delta?view=graph-rest-${version}`;
                            } else if (action === 'count') {
                                return `https://learn.microsoft.com/en-us/graph/api/${resource}-list?view=graph-rest-${version}`;
                            } else {
                                // Default GET pattern
                                return `https://learn.microsoft.com/en-us/graph/api/${singular}-get?view=graph-rest-${version}`;
                            }
                        } else if (method === 'POST') {
                            const singular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
                            return `https://learn.microsoft.com/en-us/graph/api/${singular}-post-${action}?view=graph-rest-${version}`;
                        } else if (method === 'PATCH' || method === 'PUT') {
                            const singular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
                            return `https://learn.microsoft.com/en-us/graph/api/${singular}-update?view=graph-rest-${version}`;
                        } else if (method === 'DELETE') {
                            const singular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
                            return `https://learn.microsoft.com/en-us/graph/api/${singular}-delete?view=graph-rest-${version}`;
                        }
                    } else if (segments.length >= 3) {
                        // Three or more segments like /users/{id}/messages, /groups/{id}/members
                        const subResource = segments[2];
                        const singular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
                        
                        if (method === 'GET') {
                            return `https://learn.microsoft.com/en-us/graph/api/${singular}-list-${subResource}?view=graph-rest-${version}`;
                        } else if (method === 'POST') {
                            return `https://learn.microsoft.com/en-us/graph/api/${singular}-post-${subResource}?view=graph-rest-${version}`;
                        }
                    }
                    
                    return null;
                };

                const docUrl = getEndpointDocUrl(path, record.method, apiVersion);
                const fullPath = `/${apiVersion}${path}`;

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text
                            code
                            style={{
                                cursor: onUrlFilter ? 'pointer' : 'default',
                                color: onUrlFilter ? '#50AF5BFF' : undefined,
                                fontSize: '11px'
                            }}
                            onClick={onUrlFilter ? handleUrlClick : undefined}
                            title={onUrlFilter ? 'Click to filter permissions by this URL prefix' : undefined}
                        >
                            {fullPath}
                        </Text>
                        {docUrl && (
                            <Button
                                type="text"
                                size="small"
                                icon={<LinkOutlined />}
                                onClick={() => window.open(docUrl, '_blank')}
                                title="View API documentation"
                                style={{ 
                                    padding: '0 4px',
                                    minWidth: 'auto',
                                    height: 'auto',
                                    color: '#50AF5BFF'
                                }}
                            />
                        )}
                    </div>
                );
            }
        },
        {
            title: 'Schemes',
            dataIndex: 'schemes',
            key: 'schemes',
            width: 200,
            render: (schemes: string[]) => (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {schemes.map((scheme) => (
                        <span
                            key={scheme}
                            title={scheme}
                            style={{
                                color: getSchemeColor(scheme),
                                fontSize: '16px',
                                cursor: 'help'
                            }}
                        >
                            {getSchemeIcon(scheme)}
                        </span>
                    ))}
                </div>
            )
        }
    ];

    return (
        <div
            style={{
                height: '100%',
                overflow: 'auto',
                padding: '24px',
                backgroundColor: '#1B1A19FF'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={2} style={{ color: '#50AF5BFF', margin: 0 }}>
                    <ApiOutlined style={{ marginRight: '8px' }} />
                    {permission.name}
                </Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text style={{ color: '#50AF5BFF' }}>v1.0</Text>
                        <Switch
                            checked={apiVersion === 'beta'}
                            onChange={(checked) => onApiVersionChange?.(checked ? 'beta' : 'v1.0')}
                            style={{
                                backgroundColor: apiVersion === 'beta' ? '#326c39' : undefined
                            }}
                        />
                        <Text style={{ color: '#50AF5BFF' }}>beta</Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<LinkOutlined />}
                        onClick={() => {
                            const docUrl = `https://learn.microsoft.com/en-us/graph/permissions-reference#${permission.name.toLowerCase().replace(/\./g, '')}`;
                            window.open(docUrl, '_blank');
                        }}
                        style={{ backgroundColor: '#326c39', borderColor: '#326c39' }}
                    >
                        View Docs
                    </Button>
                </div>
            </div>

            {/* Main Description Card */}
            {matchingDescription && (
                <Card style={{ marginBottom: '16px' }}>
                    <Descriptions column={1} size='small'>
                        <Descriptions.Item label='Display Name'>
                            <Text strong>{matchingDescription.adminConsentDisplayName}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label='Description'>
                            <Paragraph>{matchingDescription.adminConsentDescription}</Paragraph>
                        </Descriptions.Item>
                        <Descriptions.Item label='User Consent'>
                            <div>
                                <Text strong>{matchingDescription.consentDisplayName}</Text>
                                <br />
                                <Text type='secondary'>{matchingDescription.consentDescription}</Text>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label='Status'>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Tag color={matchingDescription.isEnabled ? 'green' : 'red'}>{matchingDescription.isEnabled ? 'Enabled' : 'Disabled'}</Tag>
                                <Tag color={matchingDescription.isAdmin ? 'orange' : 'blue'}>
                                    {matchingDescription.isAdmin ? 'Admin Required' : 'User Consent'}
                                </Tag>
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            )}

            {/* Schemes */}
            <Card title='Permission Schemes' style={{ marginBottom: '16px' }}>
                <Collapse ghost>
                    {Object.entries(permission.schemes).map(([schemeType, scheme]) => {
                        if (!scheme) return null;

                        return (
                            <Panel
                                key={schemeType}
                                header={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span
                                            title={schemeType}
                                            style={{
                                                color: getSchemeColor(schemeType),
                                                fontSize: '16px',
                                                cursor: 'help'
                                            }}
                                        >
                                            {getSchemeIcon(schemeType)}
                                        </span>
                                        <Text strong>{schemeType}</Text>
                                        <PrivilegeLevelIndicator level={scheme.privilegeLevel} />
                                        {scheme.requiresAdminConsent && <Tag color='orange'>Admin Consent Required</Tag>}
                                    </div>
                                }
                            >
                                <Descriptions column={1} size='small'>
                                    <Descriptions.Item label='Admin Display Name'>
                                        <Text strong>{scheme.adminDisplayName}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Admin Description'>
                                        <Paragraph>{scheme.adminDescription}</Paragraph>
                                    </Descriptions.Item>
                                    {scheme.userDisplayName && (
                                        <Descriptions.Item label='User Display Name'>
                                            <Text>{scheme.userDisplayName}</Text>
                                        </Descriptions.Item>
                                    )}
                                    {scheme.userDescription && (
                                        <Descriptions.Item label='User Description'>
                                            <Paragraph>{scheme.userDescription}</Paragraph>
                                        </Descriptions.Item>
                                    )}
                                    <Descriptions.Item label='Privilege Level'>
                                        <PrivilegeLevelIndicator level={scheme.privilegeLevel} />
                                    </Descriptions.Item>
                                </Descriptions>
                            </Panel>
                        );
                    })}
                </Collapse>
            </Card>

            {/* API Endpoints */}
            {apiEndpoints.length > 0 && (
                <Card title={`API Endpoints (${apiEndpoints.length})`}>
                    <Tabs
                        type='card'
                        size='middle'
                        items={[
                            // Add "All" tab first
                            {
                                key: 'all',
                                label: (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Text>All</Text>
                                        <Tag>{apiEndpoints.length}</Tag>
                                    </span>
                                ),
                                children: <EndpointTable endpoints={apiEndpoints} apiColumns={apiColumns} />
                            },
                            // Then add grouped tabs
                            ...Object.entries(groupedEndpoints)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([pathGroup, endpoints]) => ({
                                    key: pathGroup,
                                    label: (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Text>/{pathGroup}</Text>
                                            <Tag>{endpoints.length}</Tag>
                                        </span>
                                    ),
                                    children: <EndpointTable endpoints={endpoints} apiColumns={apiColumns} />
                                }))
                        ]}
                    />
                </Card>
            )}

            {/* Technical Details */}
            <Card title='Technical Details' style={{ marginTop: '16px' }}>
                <Descriptions column={2} size='small'>
                    <Descriptions.Item label='Authorization Type'>
                        <Tag>{permission.authorizationType}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label='Permission ID'>
                        <Text code>{matchingDescription?.id || 'N/A'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label='Path Sets'>
                        <Tag>{permission.pathSets.length}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label='Total Endpoints'>
                        <Tag>{apiEndpoints.length}</Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};
