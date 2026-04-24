import { checkCertificate } from '@/engine/ssl';
import { SslCheck } from '@/models/SslCheck';
import { Domain } from '@/models/Domain';

export const performAndSaveSslCheck = async (domain: Domain) => {
  try {
    const result = await checkCertificate(domain.hostname);

    const check = await SslCheck.create({
      domainId: domain.id,
      isValid: result.isValid,
      validTo: result.validTo,
      issuer: result.issuer,
      lastCheck: new Date(),
      errorMessage: result.errorMessage
    });

    console.log(`Scan réussi pour : ${domain.hostname}`);
    return {check, status: 'success'};
  } catch (scanError: any) {
    const failedCheck = await SslCheck.create({
      domainId: domain.id,
      isValid: false,
      lastCheck: new Date(),
      errorMessage: scanError.errorMessage
    });
    return {check: failedCheck, status: 'failed', error: scanError.message};
  }
};
