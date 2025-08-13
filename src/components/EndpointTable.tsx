import { Table, Select, Tag, Typography } from 'antd';
import { useState } from 'react';
import type { ApiEndpoint } from '../types/api';

const { Text } = Typography;

interface EndpointTableProps {
    endpoints: ApiEndpoint[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiColumns: any[];
}

export const EndpointTable = ({ endpoints, apiColumns }: EndpointTableProps) => {
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