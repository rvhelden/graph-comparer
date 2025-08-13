import { getPrivilegeLevelColor } from '../utils/privilegeUtils';

interface PrivilegeLevelIndicatorProps {
    level: number;
    size?: 'small' | 'large';
}

export const PrivilegeLevelIndicator = ({ level, size = 'large' }: PrivilegeLevelIndicatorProps) => {
    const rectangles = [];
    const isSmall = size === 'small';
    
    for (let i = 1; i <= 5; i++) {
        const isActive = i <= level;
        rectangles.push(
            <div
                key={i}
                style={{
                    width: isSmall ? '6px' : '8px',
                    height: isSmall ? '8px' : '12px',
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