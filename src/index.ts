import { checkCertificate } from '@/engine/ssl';

const testDomain = "cloud-elearning.com";

checkCertificate(testDomain)
    .then(() => console.log("Test réussi !"))
    .catch(err => console.error("Erreur de connexion :", err.message));