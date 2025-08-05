import { Typography, Space, Avatar, theme } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
const { useToken } = theme;

const { Title } = Typography;

export const TitleBar = () => {
    const isAuthenticated = useIsAuthenticated();
    const { accounts } = useMsal();
    const { token } = useToken();

    const account = accounts[0];
    const userName = account?.name || 'User';

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
            <Title level={3} style={{ fontFamily: 'Doctor Glitch', fontSize: 'xx-large', color: token.colorPrimary }}>
                Debble
            </Title>

            {isAuthenticated && (
                <Space>
                    <span>Welcome, {userName}</span>
                    <Avatar icon={<UserOutlined />} />
                </Space>
            )}
        </div>
    );
};
