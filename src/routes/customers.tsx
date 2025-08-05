import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Input, Button, Space, Card, Alert, Spin, Table, Tabs, Tag, Tooltip } from 'antd';
const { Column } = Table;
import { SearchOutlined, ReloadOutlined, SendOutlined, BarChartOutlined, CodeOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd/es/table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import type { Customer, DeploymentEnvironment } from '../schemas/models';
import { useMsal } from '@azure/msal-react';
import { DebbleApiContext } from '../services/DebbleApiContext';

export const Route = createFileRoute('/customers')({
    component: CustomersPage
});

// Component for individual customer table per deployment environment
function CustomerTable({ environment }: { environment: string }) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [globalFilter, setGlobalFilter] = useState('');
    const { instance } = useMsal();
    const context = new DebbleApiContext(instance);

    const {
        data: customersData,
        isLoading,
        error,
        refetch,
        isFetching
    } = useQuery({
        queryKey: ['customers', { deploymentEnvironmentName: environment, current, pageSize, globalFilter }],
        queryFn: () => {
            let query = context.customers
                .skip((current - 1) * pageSize)
                .top(pageSize)
                .orderBy((x) => x.Name)
                .filter((x) => x.Ring.DeploymentEnvironmentName.$equals(environment))
                .select('Id', 'Name', 'TenantName', 'TenantDomain', 'RingName', 'Workplace', 'TeamsGovernance', 'KnowledgeBase', 'CWP', 'TopDesk')
                .expand('Workplace', 'TeamsGovernance', 'KnowledgeBase', 'CWP', 'TopDesk');

            if (globalFilter != '') {
                query = query.filter((x) =>
                    x.Name.$contains(globalFilter).or(x.TenantName.$contains(globalFilter)).or(x.TenantDomain.$contains(globalFilter))
                );
            }

            return query.getManyWithCountAsync();
        }
    });

    // Helper function to get enabled features as tags
    const getFeatureTags = (customer: Customer) => {
        const features = [];
        if (customer.Workplace?.Enabled) features.push('WP');
        if (customer.TeamsGovernance?.Enabled) features.push('DTG');
        if (customer.KnowledgeBase?.Enabled) features.push('KB');
        if (customer.CWP?.Enabled) features.push('CWP');
        if (customer.TopDesk?.Enabled) features.push('TD');
        return features;
    };

    // Handle row click to navigate to customer details
    const handleRowClick = (customer: Customer) => {
        navigate({ to: `/customers/${customer.Id}` });
    };

    // Action handlers
    const handleUpdate = (customer: Customer, e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('Update customer:', customer.Id);
        // TODO: Implement update functionality
    };

    const handleActivity = (customer: Customer, e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('View activity:', customer.Id);
        // TODO: Implement activity view
    };

    const handleDeployments = (customer: Customer, e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('View deployments:', customer.Id);
        // TODO: Implement deployments view
    };

    const handleDelete = (customer: Customer, e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('Delete customer:', customer.Id);
        // TODO: Implement delete functionality
    };

    const customers = (customersData?.value || []) as unknown as Customer[];
    const totalCount = (customersData as Record<string, any>)?.['@odata.count'] || 0;

    const handleTableChange: TableProps<Customer>['onChange'] = (pagination) => {
        if (pagination) {
            setCurrent(pagination.current || 1);
            setPageSize(pagination.pageSize || 10);
        }
    };

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        refetch();
    };

    const handleSearch = (value: string) => {
        setGlobalFilter(value);
        setCurrent(1);
    };

    if (error) {
        return (
            <Alert
                message='Error loading customers'
                description={error.message}
                type='error'
                showIcon
                action={
                    <Button size='small' onClick={handleRefresh}>
                        Retry
                    </Button>
                }
            />
        );
    }

    return (
        <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
            {/* Search and Actions */}
            <Space>
                <Input.Search
                    placeholder='Search customers by name, tenant name or domain'
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    onSearch={handleSearch}
                    onPressEnter={() => handleSearch(globalFilter)}
                    style={{ width: 350 }}
                    enterButton={<SearchOutlined />}
                    loading={isFetching}
                />
                <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={isLoading || isFetching}>
                    Refresh
                </Button>
            </Space>

            {/* Table */}
            <Table<Customer>
                dataSource={customers}
                rowKey='Id'
                loading={isLoading || isFetching}
                onChange={handleTableChange}
                onRow={(customer) => ({
                    onClick: () => handleRowClick(customer),
                    style: { cursor: 'pointer' }
                })}
                pagination={{
                    current,
                    pageSize,
                    total: totalCount,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} customers`,
                    pageSizeOptions: ['10', '20', '50', '100']
                }}
                scroll={{ x: 1000 }}
                size='small'
            >
                <Column title='Customer Name' dataIndex='Name' key='Name' width={200} sorter defaultSortOrder='ascend' />
                <Column title='Ring' dataIndex='RingName' key='RingName' width={120} sorter render={(value: string) => value || '—'} />
                <Column
                    title='Workplace URL'
                    key='WorkplaceUrl'
                    width={200}
                    render={(_, customer: Customer) => {
                        const url = customer.Workplace?.Url;
                        return url ? (
                            <a href={url} target='_blank' rel='noopener noreferrer' onClick={(e) => e.stopPropagation()}>
                                {url}
                            </a>
                        ) : (
                            '—'
                        );
                    }}
                />
                <Column
                    title='Features'
                    key='Features'
                    width={300}
                    render={(_, customer: Customer) => {
                        const features = getFeatureTags(customer);
                        return (
                            <Space wrap>
                                {features.map((feature) => (
                                    <Tag key={feature} color='green'>
                                        {feature}
                                    </Tag>
                                ))}
                                {features.length === 0 && <span style={{ color: '#999' }}>—</span>}
                            </Space>
                        );
                    }}
                />
                <Column
                    title='Actions'
                    key='Actions'
                    width={200}
                    render={(_, customer: Customer) => (
                        <Space>
                            <Tooltip title='Update'>
                                <Button type='primary' size='small' icon={<SendOutlined />} onClick={(e) => handleUpdate(customer, e)} />
                            </Tooltip>
                            <Tooltip title='Activity'>
                                <Button type='primary' size='small' icon={<BarChartOutlined />} onClick={(e) => handleActivity(customer, e)} />
                            </Tooltip>
                            <Tooltip title='Deployments & Access Tokens'>
                                <Button type='primary' size='small' icon={<CodeOutlined />} onClick={(e) => handleDeployments(customer, e)} />
                            </Tooltip>
                            <Tooltip title='Access Tokens'>
                                <Button type='primary' size='small' icon={<CodeOutlined />} onClick={(e) => handleDeployments(customer, e)} />
                            </Tooltip>
                            <Tooltip title='Delete'>
                                <Button type='text' size='small' icon={<DeleteOutlined />} danger onClick={(e) => handleDelete(customer, e)} />
                            </Tooltip>
                        </Space>
                    )}
                />
            </Table>
        </Space>
    );
}

// Main customers page with tabs
function CustomersPage() {
    const { instance } = useMsal();
    const context = new DebbleApiContext(instance);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['deploymentEnvironments'],
        queryFn: async () => await context.deploymentEnvironments.orderBy((x) => x.Order).getManyAsync()
    });

    if (isLoading || isFetching) {
        return (
            <Card title='Customers' style={{ margin: 0 }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin size='large' />
                </div>
            </Card>
        );
    }

    const environments = (data?.value || []) as DeploymentEnvironment[];

    // Create tab items
    const tabItems = environments.map((env: DeploymentEnvironment) => ({
        key: env.Name,
        label: env.Name,
        children: <CustomerTable environment={env.Name} />
    }));

    return <Tabs items={tabItems} defaultActiveKey='all' size='small' />;
}
