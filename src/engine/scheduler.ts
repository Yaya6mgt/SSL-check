import cron from 'node-cron';
import { checkCertificate } from '@/engine/ssl';

const domainsToMonitor = [
    'cloud-elearning.com',
    'live.olfp.net',
    'demo-onlineformapro.com'
];

export function initScheduler() {
    console.log("Automatisation initialisée");

    cron.schedule('*/1 * * * *', async () => {
        console.log(`Lancement de la vérification automatique : ${new Date().toLocaleString()}`);

        for (const domain of domainsToMonitor) {
            try {
                const result = await checkCertificate(domain);
                console.log(`${domain} : Expire dans ${result.daysRemaining} jours.`);

            } catch (error: any) {
                console.error(`Erreur sur ${domain} : ${error.message}`);
            }
        }
    });
}