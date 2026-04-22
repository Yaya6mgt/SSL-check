import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { Alert } from '@/models/Alert';
import { getAlertThreshold } from '@/utils/health-status';
import { Recipient } from '@/models/Recipients';

export class NotificationService {
    private static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    static async checkAndPrepareAlert(domainId: number, hostname: string, serverName: string, daysRemaining: number | null, error?: string) {
        const threshold = getAlertThreshold(daysRemaining);

        if (threshold === null && daysRemaining !== null && daysRemaining > 30) {
            await Alert.destroy({ where: { domainId } });
            return null;
        }

        if (threshold === null) return null;

        const alreadySent = await Alert.findOne({
            where: { domainId, level: threshold.toString() }
        });

        if (alreadySent) return null;

        return {
            domainId,
            hostname,
            serverName,
            days: daysRemaining !== null ? `${daysRemaining}j` : 'ERREUR',
            level: threshold === 7 ? 'CRITIQUE' : threshold === 14 ? 'ATTENTION' : 'INFO',
            color: threshold === 7 ? '#D32F2F' : threshold === 14 ? '#F57C00' : '#0288D1',
            threshold: threshold.toString()
        };
    }

    static async sendBulkAlerts(alerts: any[]) {
        if (alerts.length === 0) return;

        const dbRecipients = await Recipient.findAll({ where: { isActive: true } });
        let emailList = dbRecipients.map(r => r.email);
        if (emailList.length === 0) {
            emailList = [process.env.ADMIN_EMAIL || "admin-default@onlineformapro.com"];
        }
        const templatePath = path.join(__dirname, '..', 'templates', 'alert-email.html');

        try {
            let tableRows = "";
            for (const alert of alerts) {
                tableRows += `
                    <tr>
                        <td style="padding:10px; border:1px solid #ddd;">${alert.hostname}</td>
                        <td style="padding:10px; border:1px solid #ddd;">${alert.serverName}</td>
                        <td style="padding:10px; border:1px solid #ddd;">${alert.days}</td>
                        <td style="padding:10px; border:1px solid #ddd; color: ${alert.color}; font-weight: bold;">${alert.level}</td>
                    </tr>`;
            }

            let htmlContent = await fs.readFile(templatePath, 'utf-8');
            htmlContent = htmlContent.replace(/{{tableContent}}/g, tableRows);

            await this.transporter.sendMail({
                from: '"SSL Monitor Onlineformapro" <noreply@onlineformapro.com>',
                to: emailList.join(', '),
                subject: `Récapitulatif alertes SSL - ${alerts.length} domaine(s)`,
                html: htmlContent,
            });

            for (const alert of alerts) {
                await Alert.create({
                    domainId: alert.domainId,
                    level: alert.threshold,
                    sentAt: new Date()
                });
            }

            console.log(`Mail récapitulatif envoyé pour ${alerts.length} domaines.`);
        } catch (err) {
            console.error("Erreur lors de l'envoi du mail groupé :", err);
        }
    }
}