import fs from 'fs';
import { Domain } from '@/models/Domain';
import { SslCheck } from '@/models/SslCheck';

export const exportStatusToCsv = async (outputPath: string) => {
    try {
        const domains = await Domain.findAll({
            include: [{
                model: SslCheck,
                limit: 1,
                order: [['last_check', 'DESC']]
            }]
        });

        let csvContent = 'hostname,status,valid_to,issuer,last_check,error_message\n';

        for (const domain of domains) {
            const lastCheck = domain.checks?.[0];
            const hostname = domain.hostname;
            const status = lastCheck ? (lastCheck.isValid ? 'VALIDE' : 'ERREUR') : 'NON_SCANNE';
            const validTo = lastCheck?.validTo ? lastCheck.validTo.toISOString() : 'N/A';
            const issuer = lastCheck?.issuer || 'N/A';
            const lastCheckDate = lastCheck?.lastCheck ? lastCheck.lastCheck.toLocaleString() : 'N/A';
            const error = lastCheck?.errorMessage ? lastCheck.errorMessage.replace(/,/g, ' ') : '';

            csvContent += `${hostname},${status},${validTo},${issuer},${lastCheckDate},${error}\n`;
        }

        fs.writeFileSync(outputPath, csvContent);
        return true;
    } catch (error) {
        console.error("Erreur lors de la génération de l'export :", error);
        throw error;
    }
};