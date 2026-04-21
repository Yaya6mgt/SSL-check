import tls from 'tls';

export function checkCertificate(host: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const socket = tls.connect({
            host: host,
            port: 443,
            servername: host,
        }, () => {
            const cert = socket.getPeerCertificate();
            console.log(`--- Rapport pour ${host} ---`);
            console.log(`Expire le : ${cert.valid_to}`);
            console.log(`Émetteur : ${cert.issuer.O}`);
            console.log(`SANs : ${cert.subjectaltname}`);

            socket.end();
            resolve();
        });

        socket.on('error', (err) => {
            reject(err);
        });
    });
}