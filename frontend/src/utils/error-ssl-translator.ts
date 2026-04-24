export const translateSslError = (error: string | null | undefined): string => {
  if (!error) return "Aucune erreur détectée.";

  const code = error.toUpperCase();

  if (code.includes('CERT_HAS_EXPIRED')) return "Le certificat a expiré.";
  if (code.includes('DEPTH_ZERO_SELF_SIGNED_CERT')) return "Certificat auto-signé : l'autorité de certification n'est pas reconnue.";
  if (code.includes('ERR_TLS_CERT_ALTNAME_INVALID')) return "Le nom de domaine ne correspond pas aux noms autorisés par le certificat (Mismatch).";
  if (code.includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE')) return "Chaîne de certification incomplète (Intermediate certificate manquant).";
  if (code.includes('CERT_UNTRUSTED')) return "Le certificat provient d'une source non approuvée par le système.";
  if (code.includes('CERT_REVOKED')) return "Le certificat a été révoqué par l'autorité émettrice.";
  if (code.includes('CERT_SIGNATURE_FAILURE')) return "La signature numérique du certificat est invalide.";

  if (code.includes('ENOTFOUND')) return "DNS : Le nom de domaine n'existe pas ou n'est pas résolu.";
  if (code.includes('ECONNREFUSED')) return "Connexion refusée : Le port 443 est fermé ou le service est arrêté.";
  if (code.includes('ETIMEDOUT')) return "Délai d'attente dépassé : Le serveur ne répond pas (Timeout).";
  if (code.includes('EHOSTUNREACH')) return "Hôte injoignable : Problème de routage ou serveur éteint.";
  if (code.includes('ECONNRESET')) return "La connexion a été coupée brutalement par le serveur distant.";
  if (code.includes('EPROTO')) return "Erreur de protocole : Problème lors du 'Handshake' TLS/SSL.";

  return error.replace(/_/g, ' ').replace('ERR TLS CERT ', '');
};