"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ssl_1 = require("@/engine/ssl");
const testDomain = "cloud-elearning.com";
(0, ssl_1.checkCertificate)(testDomain)
    .then(() => console.log("Test réussi !"))
    .catch(err => console.error("Erreur de connexion :", err.message));
//# sourceMappingURL=index.js.map