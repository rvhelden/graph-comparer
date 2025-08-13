import { Input, Typography, Button, Badge } from 'antd';
import { SearchOutlined, SwapOutlined, ClearOutlined, TeamOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Text } = Typography;

interface PermissionsListHeaderProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    urlFilter?: string;
    showRscOnly: boolean;
    onShowRscOnlyChange: (show: boolean) => void;
    comparisonMode: boolean;
    onComparisonModeToggle?: () => void;
    onUrlFilterChange?: (urlFilter: string | undefined) => void;
}

export const PermissionsListHeader = ({
    searchTerm,
    onSearchChange,
    urlFilter,
    showRscOnly,
    onShowRscOnlyChange,
    comparisonMode,
    onComparisonModeToggle,
    onUrlFilterChange
}: PermissionsListHeaderProps) => {
    return (
        <div style={{ padding: '16px', borderBottom: '1px solid #303030', flexShrink: 0 }}>
            <Search
                placeholder='Search permissions & URLs...'
                allowClear
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <Text type='secondary'>{urlFilter && <Text type='warning'> (filtered)</Text>}</Text>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        type={showRscOnly ? 'primary' : 'default'}
                        size='small'
                        icon={<TeamOutlined />}
                        onClick={() => onShowRscOnlyChange(!showRscOnly)}
                        title='Show only Resource Specific Consent permissions'
                    >
                        RSC
                    </Button>
                    <Button type={comparisonMode ? 'primary' : 'default'} size='small' icon={<SwapOutlined />} onClick={onComparisonModeToggle}>
                        Compare
                    </Button>
                    {urlFilter && (
                        <Button size='small' icon={<ClearOutlined />} onClick={() => onUrlFilterChange?.(undefined)}>
                            Clear Filter
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
