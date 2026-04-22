export enum AlertThreshold {
    CRITICAL = 7,
    WARNING = 14,
    INFO = 30
}

export const getAlertThreshold = (days: number | null): AlertThreshold | null => {
    if (days === null) return AlertThreshold.CRITICAL;
    if (days <= AlertThreshold.CRITICAL) return AlertThreshold.CRITICAL;
    if (days <= AlertThreshold.WARNING) return AlertThreshold.WARNING;
    if (days <= AlertThreshold.INFO) return AlertThreshold.INFO;
    return null;
};