import cron from 'node-cron';
import { checkCertificate } from '@/engine/ssl';
import { Domain } from '@/models/Domain';
import { SslCheck } from '@/models/SslCheck';

export async function runMonitoringCycle() {
    console.log(`\nDémarrage du cycle : ${new Date().toLocaleString()}`);

    const domains = await Domain.findAll();

    if (domains.length === 0) {
        console.log("Aucun domaine trouvé en base de données. Vérifiez l'import CSV.");
        return;
    }

    for (const domain of domains) {
        try {
            console.log(`Scan en cours : ${domain.hostname}`);
            const result = await checkCertificate(domain.hostname);

            await SslCheck.create({
                domainId: domain.id,
                isValid: true,
                validTo: result.validTo,
                issuer: result.issuer,
                lastCheck: new Date(),
                errorMessage: null
            });

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

            console.error(`Échec pour ${domain.hostname} : ${error.message}`);
        }
    }
    console.log('Cycle de vérification terminé.\n');
}

export function initScheduler() {
    console.log("Automatisation du Moniteur SSL initialisée");

    runMonitoringCycle();

    cron.schedule('*/1 * * * *', async () => {
        await runMonitoringCycle();
    });
}