"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCertificate = checkCertificate;
const tls_1 = __importDefault(require("tls"));
function checkCertificate(host) {
    return new Promise((resolve, reject) => {
        const socket = tls_1.default.connect({
            host: host,
            port: 443,
            servername: host,
        }, () => {
            const cert = socket.getPeerCertificate();
            console.log(`--- Rapport pour ${host} ---`);
            console.log(`Expire le : ${cert.valid_to}`);
            console.log(`Émetteur : ${cert.issuer.O}`);
            // Les SANS sont cruciaux pour la suite (S2)
            console.log(`SANs : ${cert.subjectaltname}`);
            socket.end();
            resolve();
        });
        socket.on('error', (err) => {
            reject(err);
        });
    });
}
//# sourceMappingURL=ssl.js.map