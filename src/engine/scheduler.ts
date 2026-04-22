import cron from 'node-cron';
import { checkCertificate } from '@/engine/ssl';
import { Domain } from '@/models/Domain';
import { SslCheck } from '@/models/SslCheck';
import { getAlertLevel, AlertLevel } from '@/utils/health-status';
import { NotificationService } from '@/services/notification.service';

export async function runMonitoringCycle() {
    console.log(`\nDémarrage du cycle : ${new Date().toLocaleString()}`);

    const domains = await Domain.findAll();

    for (const domain of domains) {
        try {
            const result = await checkCertificate(domain.hostname);

            await SslCheck.create({
                domainId: domain.id,
                isValid: true,
                validTo: result.validTo,
                issuer: result.issuer,
                lastCheck: new Date(),
                errorMessage: null
            });

            const level = getAlertLevel(result.daysRemaining, true);
            await NotificationService.notify(domain.hostname, level, result.daysRemaining);

            console.log(`${domain.hostname} : Expire dans ${result.daysRemaining} jours.`);

        } catch (error: any) {
            await SslCheck.create({
                domainId: domain.id,
                isValid: false,
                validTo: null,
                issuer: null,
                lastCheck: new Date(),
                errorMessage: error.message || 'Erreur inconnue'
            });

            await NotificationService.notify(domain.hostname, AlertLevel.HIGH, null, error.message);

            console.error(`Échec pour ${domain.hostname} : ${error.message}`);
        }
    }
}

export function initScheduler() {
    console.log("Automatisation initialisée");
    runMonitoringCycle();
    cron.schedule('*/1 * * * *', async () => {
        await runMonitoringCycle();
    });
}