import cron from 'node-cron';
import { Domain } from '@/models/Domain';
import { NotificationService } from '@/services/notification.service';
import { performAndSaveSslCheck } from '@/services/ssl.service';

export async function runMonitoringCycle() {
  console.log(`\nDémarrage du cycle : ${new Date().toLocaleString()}`);


  const domains = await Domain.findAll({ include: ['server'] });
  const alertsToNotify = [];

  for (const domain of domains) {
    const response = await performAndSaveSslCheck(domain);
    const alert = await NotificationService.checkAndPrepareAlert(
        domain.id,
        domain.hostname,
        domain.server?.name || 'Inconnu',
        response.check.validTo ? Math.floor((response.check.validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null,
        response.check.errorMessage,
        response.check.isValid
    );
    if (alert) alertsToNotify.push(alert);
  }

  if (alertsToNotify.length > 0) {
      await NotificationService.sendBulkAlerts(alertsToNotify);
  }
}

export function initScheduler() {
    console.log("Automatisation initialisée");
    runMonitoringCycle();
    // 0 8 * * * pour tous les jours à 8h du matin
    cron.schedule('0 8 * * *', async () => {
        await runMonitoringCycle();
    });
}