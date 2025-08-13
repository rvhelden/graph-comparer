import { Card, Typography, Descriptions, Tag, Collapse, Empty, Tabs, Button, Alert } from 'antd';
import { ApiOutlined, LinkOutlined, TeamOutlined } from '@ant-design/icons';
import type { Permission, PermissionDescription } from '../hooks/usePermissions';
import { PrivilegeLevelIndicator } from './PrivilegeLevelIndicator';
import { EndpointTable } from './EndpointTable';
import { getRscScopeInfo } from '../utils/rscUtils';
import { getSchemeIcon, getSchemeColor } from '../utils/schemeUtils';
import type { ApiEndpoint } from '../types/api';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;


interface PermissionDetailsProps {
    permission: Permission | null;
    descriptions: PermissionDescription[];
    onUrlFilter: (url: string) => void;
    apiVersion?: 'v1.0' | 'beta';
}

export const PermissionDetails = ({ permission, descriptions, onUrlFilter, apiVersion = 'v1.0' }: PermissionDetailsProps) => {
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
            render: (path: string) => {
                const fullPath = `/${apiVersion}${path}`;

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text style={{ cursor: 'pointer' }} onClick={() => onUrlFilter(path)} title='Click to filter permissions by this URL prefix'>
                            {fullPath}
                        </Text>
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
                    <Button
                        type='primary'
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

            {/* RSC Information Card */}
            {permission.authorizationType === 'RSC' && (
                <Alert
                    message={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TeamOutlined style={{ color: '#1890ff' }} />
                            <Text strong>Resource Specific Consent (RSC) Permission</Text>
                            {(() => {
                                const scopeInfo = getRscScopeInfo(permission.name);
                                return scopeInfo ? (
                                    <Tag icon={scopeInfo.icon} color={scopeInfo.color}>
                                        {scopeInfo.scope}
                                    </Tag>
                                ) : null;
                            })()}
                        </div>
                    }
                    description={(() => {
                        const scopeInfo = getRscScopeInfo(permission.name);
                        return (
                            <div>
                                <Text>
                                    {scopeInfo
                                        ? scopeInfo.description
                                        : 'This permission requires resource-specific consent and is typically used by Microsoft Teams applications.'}
                                </Text>
                                <br />
                                <Text type='secondary'>
                                    Apps with RSC permissions only access resources where they are explicitly installed or granted access.
                                </Text>
                            </div>
                        );
                    })()}
                    type='info'
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
            )}

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
