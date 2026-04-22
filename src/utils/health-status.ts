export enum AlertLevel {
    NONE = 'NONE',
    LOW = 'LOW',       // > 30 jours
    MEDIUM = 'MEDIUM', // < 21 jours
    HIGH = 'HIGH',     // < 7 jours ou une erreur
}

export const getAlertLevel = (daysRemaining: number | null, isValid: boolean): AlertLevel => {
    if (!isValid || daysRemaining === null || daysRemaining <= 7) {
        return AlertLevel.HIGH;
    }
    if (daysRemaining <= 21) {
        return AlertLevel.MEDIUM;
    }
    if (daysRemaining <= 30) {
        return AlertLevel.LOW;
    }
    return AlertLevel.NONE;
};
