export const getPrivilegeLevelColor = (level: number) => {
    if (level <= 1) return '#1890ff';
    if (level <= 2) return '#faad14';
    if (level <= 3) return '#fa8c16';
    return '#f5222d';
};