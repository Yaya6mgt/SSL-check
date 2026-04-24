import { parseSANs } from '@/utils/ssl-parser';
import * as tls from 'node:tls';

export interface SSLCheckResult {
    domain: string;
    validTo?: Date;
    daysRemaining?: number;
    issuer?: string;
    sans?: string[];
    isValid: boolean;
    errorMessage?: string;
}

export function checkCertificate(host: string): Promise<SSLCheckResult> {
    return new Promise((resolve, reject) => {
        const socket = tls.connect({
            host: host,
            port: 443,
            servername: host,
            timeout: 5000,
            rejectUnauthorized: false
        }, () => {
            const cert: tls.PeerCertificate = socket.getPeerCertificate();

            if (!cert || Object.keys(cert).length === 0) {
                socket.destroy();
                return reject(new Error("Aucun certificat reçu."));
            }

            const validTo = new Date(cert.valid_to);
            const now = new Date();
            const diffTime = validTo.getTime() - now.getTime();
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let errorMsg = undefined;
            const isValid = (socket as any).authorized || false;
            if (!isValid) {
                errorMsg = (socket as any).authorizationError || "Certificat non approuvé (Self-signed ou Host mismatch)";
                console.log("SSL non valide pour " + host + " : " + errorMsg);
            }

            const result: SSLCheckResult = {
                domain: host,
                validTo: validTo,
                daysRemaining: daysRemaining,
                issuer: cert.issuer.O ? String(cert.issuer.O) : "Inconnu",
                sans: parseSANs(cert.subjectaltname),
                isValid: isValid,
                errorMessage: errorMsg
            };

            socket.end();
            resolve(result);
        });

        socket.on('error', (err: Error) => {
            const nodeErr = err as NodeJS.ErrnoException;
            let message = "";

            switch (nodeErr.code) {
                case 'ENOTFOUND': message = `DNS : Domaine ${host} introuvable.`; break;
                case 'ECONNREFUSED': message = `Port 443 fermé sur ${host}.`; break;
                case 'ETIMEDOUT':
                case 'EHOSTUNREACH': message = `Hôte ${host} injoignable (Timeout réseau/Firewall).`; break;
                default: message = `${nodeErr.code || 'Erreur'} : ${err.message}`;
            }
            socket.destroy();
            resolve({ domain: host, isValid: false, errorMessage: message });
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve({ domain: host, isValid: false, errorMessage: `Le serveur ${host} ne répond pas (Timeout 5s).` });
        });
    });
}