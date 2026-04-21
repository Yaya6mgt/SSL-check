import { parseSANs } from '@/utils/ssl-parser';
import * as tls from 'node:tls';

export interface SSLCheckResult {
    domain: string;
    validTo: Date;
    daysRemaining: number;
    issuer: string;
    sans: string[];
}

export function checkCertificate(host: string): Promise<SSLCheckResult> {
    return new Promise((resolve, reject) => {
        const socket = tls.connect({
            host: host,
            port: 443,
            servername: host,
            timeout: 5000,
        }, () => {
            const cert: tls.PeerCertificate = socket.getPeerCertificate();

            if (!cert || Object.keys(cert).length === 0) {
                return reject(new Error("Aucun certificat reçu."));
            }

            const validTo = new Date(cert.valid_to);
            const now = new Date();
            const diffTime = validTo.getTime() - now.getTime();
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const result: SSLCheckResult = {
                domain: host,
                validTo: validTo,
                daysRemaining: daysRemaining,
                issuer: String(cert.issuer.O) || "Inconnu",
                sans: parseSANs(cert.subjectaltname)
            };

            socket.end();
            resolve(result);
        });

        socket.on('error', (err: Error) => {
            if ('code' in err) {
                const nodeErr = err as NodeJS.ErrnoException;
                if (nodeErr.code === 'ENOTFOUND') reject(new Error(`DNS : Domaine ${host} introuvable.`));
                else if (nodeErr.code === 'ECONNREFUSED') reject(new Error(`Port 443 fermé sur ${host}.`));
                else reject(new Error(`${nodeErr.code} : ${nodeErr.message}`));
            } else {
                reject(err);
            }
        });

        socket.on('timeout', () => {
            socket.destroy();
            reject(new Error(`Timeout sur ${host}`));
        });
    });
}