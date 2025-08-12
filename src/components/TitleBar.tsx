import { Typography, theme } from 'antd';
const { useToken } = theme;

const { Title } = Typography;

export const TitleBar = () => {
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
            <Title level={3} style={{ fontFamily: 'Doctor Glitch', fontSize: 'xx-large', color: token.colorPrimary }}>
                Graph permission comparer
            </Title>
        </div>
    );
};
