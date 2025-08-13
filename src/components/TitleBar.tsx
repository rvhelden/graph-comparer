import { Typography, theme, Switch, Button } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
const { useToken } = theme;

const { Title, Text } = Typography;

interface TitleBarProps {
    apiVersion?: 'v1.0' | 'beta';
    onApiVersionChange?: (version: 'v1.0' | 'beta') => void;
    hideDisabled?: boolean;
    onHideDisabledChange?: (hide: boolean) => void;
}

export const TitleBar = ({ 
    apiVersion = 'v1.0', 
    onApiVersionChange, 
    hideDisabled = true, 
    onHideDisabledChange 
}: TitleBarProps) => {
    const { token } = useToken();

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '100%',
                padding: '0 24px'
            }}
        >
            <Title level={3} style={{ fontFamily: 'Doctor Glitch', fontSize: 'xx-large', color: token.colorPrimary, margin: 0 }}>
                Graph permission comparer
            </Title>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {/* Enabled/Disabled Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Button
                        type={hideDisabled ? 'primary' : 'default'}
                        size="small"
                        icon={hideDisabled ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        onClick={() => onHideDisabledChange?.(!hideDisabled)}
                        title={hideDisabled ? "Show disabled permissions" : "Hide disabled permissions"}
                    >
                        {hideDisabled ? 'Enabled Only' : 'Show All'}
                    </Button>
                </div>

                {/* API Version Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text style={{ color: token.colorPrimary }}>v1.0</Text>
                    <Switch
                        checked={apiVersion === 'beta'}
                        onChange={(checked) => onApiVersionChange?.(checked ? 'beta' : 'v1.0')}
                        style={{
                            backgroundColor: apiVersion === 'beta' ? token.colorPrimary : undefined
                        }}
                    />
                    <Text style={{ color: token.colorPrimary }}>beta</Text>
                </div>
            </div>
        </div>
    );
};
