import cron from 'node-cron';
import { checkCertificate } from '@/engine/ssl';
import { Domain } from '@/models/Domain';
import { NotificationService } from '@/services/notification.service';
import { SslCheck } from '@/models/SslCheck';

export async function runMonitoringCycle() {
  console.log(`\nDémarrage du cycle : ${new Date().toLocaleString()}`);


  const domains = await Domain.findAll({ include: ['server'] });
  const alertsToNotify = [];

  for (const domain of domains) {
    try {
        const result = await checkCertificate(domain.hostname);

      await SslCheck.create({
        domainId: domain.id,
        isValid: result.isValid,
        validTo: result.validTo,
        issuer: result.issuer,
        lastCheck: new Date(),
        errorMessage: null
      });

        const alert = await NotificationService.checkAndPrepareAlert(
            domain.id,
            domain.hostname,
            domain.server?.name || 'Inconnu',
            result.daysRemaining
        );
        if (alert) alertsToNotify.push(alert);

    } catch (error: any) {

      await SslCheck.create({
        domainId: domain.id,
        isValid: false,
        validTo: null,
        issuer: 'Inconnu',
        lastCheck: new Date(),
        errorMessage: error.message
      });

      const alert = await NotificationService.checkAndPrepareAlert(
          domain.id,
          domain.hostname,
          domain.server?.name || 'Inconnu',
          null,
          error.message
      );
      if (alert) alertsToNotify.push(alert);
    }
  }

  if (alertsToNotify.length > 0) {
      await NotificationService.sendBulkAlerts(alertsToNotify);
  }
}

export function initScheduler() {
    console.log("Automatisation initialisée");
    runMonitoringCycle();
    // 0 8 * * * pour tous les jours à 8h du matin
    cron.schedule('*/1 * * * *', async () => {
        await runMonitoringCycle();
    });
}