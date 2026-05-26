import nodemailer from 'nodemailer';
import { Alert } from '@/models/Alert';
import { getAlertThreshold } from '@/utils/health-status';
import { Recipient } from '@/models/Recipients';
import { translateSslError } from '@/utils/error-ssl-translator';
import { AlertThresholdService } from './alert-threshold.service';
import { EmailTemplateService } from './email-template.service';

export class NotificationService {
    private static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    static async checkAndPrepareAlert(domainId: number, hostname: string, serverName: string, daysRemaining: number | null, error?: string, isValid?: boolean) {
        const thresholds = await AlertThresholdService.getCurrentThresholds();

        if (error || daysRemaining === null || !isValid) {
            const sentToday = await Alert.findOne({
                where: {
                    domainId,
                    level: 'ERROR',
                }
            });

            if (sentToday) {
                await sentToday.destroy();
            }

            return {
                domainId,
                hostname,
                serverName,
                days: daysRemaining || 'ÉCHEC',
                level: 'CRITIQUE (Erreur)',
                color: '#D32F2F',
                threshold: 'ERROR',
                error: error
            };
        }
        const threshold = getAlertThreshold(daysRemaining, thresholds);

        if (threshold === null && daysRemaining > thresholds.info) {
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
            level: threshold === thresholds.critical ? 'CRITIQUE' : threshold === thresholds.warning ? 'ATTENTION' : 'INFO',
            color: threshold === thresholds.critical ? '#D32F2F' : threshold === thresholds.warning ? '#F57C00' : '#0288D1',
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
        const templateSettings = await EmailTemplateService.getCurrentSettings();

        try {
            let tableRows = "";
            for (const alert of alerts) {
                const statusInfo = alert.error ? `<br/><small style="color: #666;">${translateSslError(alert.error)}</small>` : '';
                tableRows += `
                    <tr>
                        <td style="padding:10px; border:1px solid ${templateSettings.borderColor};">${alert.hostname}</td>
                        <td style="padding:10px; border:1px solid ${templateSettings.borderColor};">${alert.serverName}</td>
                        <td style="padding:10px; border:1px solid ${templateSettings.borderColor};">${alert.days}</td>
                        <td style="padding:10px; border:1px solid ${templateSettings.borderColor}; color: ${alert.color}; font-weight: bold;">
                            ${alert.level} ${statusInfo}
                        </td>
                    </tr>`;
            }

            const htmlContent = await EmailTemplateService.renderEmailHtml(tableRows, templateSettings);

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