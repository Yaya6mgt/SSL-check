import { AlertLevel } from '@/utils/health-status';

export class NotificationService {
    static async notify(hostname: string, level: AlertLevel, daysRemaining: number | null, error?: string) {
        if (level === AlertLevel.NONE) return;

        const icons = {
            [AlertLevel.LOW]: 'ℹ️',
            [AlertLevel.MEDIUM]: '⚠️',
            [AlertLevel.HIGH]: '🚨'
        };

        console.log(`
            ${icons[level]} --- ALERTE SSL [${level}] ---
            Domaine : ${hostname}
            Statut  : ${daysRemaining !== null ? `${daysRemaining} jours restants` : 'ERREUR'}
            Message : ${error || 'Le certificat expire bientôt.'}
            -----------------------------------
        `);
    }
}