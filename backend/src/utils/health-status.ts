export interface AlertThresholds {
    critical: number;
    warning: number;
    info: number;
}

export const DEFAULT_ALERT_THRESHOLDS: AlertThresholds = {
    critical: 7,
    warning: 14,
    info: 30,
};

export const normalizeAlertThresholds = (thresholds?: Partial<AlertThresholds>): AlertThresholds => ({
    critical: thresholds?.critical ?? DEFAULT_ALERT_THRESHOLDS.critical,
    warning: thresholds?.warning ?? DEFAULT_ALERT_THRESHOLDS.warning,
    info: thresholds?.info ?? DEFAULT_ALERT_THRESHOLDS.info,
});

export const getAlertThreshold = (days: number | null, thresholds: AlertThresholds = DEFAULT_ALERT_THRESHOLDS): number | null => {
    if (days === null) return thresholds.critical;
    if (days <= thresholds.critical) return thresholds.critical;
    if (days <= thresholds.warning) return thresholds.warning;
    if (days <= thresholds.info) return thresholds.info;
    return null;
};