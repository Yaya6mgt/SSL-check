import { checkCertificate } from '@/engine/ssl';

describe('SSL Engine', () => {
    jest.setTimeout(10000);

    it('doit récupérer les infos pour un domaine valide', async () => {
        const result = await checkCertificate('google.com');
        expect(result.isValid).toBe(true);
        expect(result.daysRemaining).toBeGreaterThan(0);
        expect(typeof result.issuer).toBe('string');
    });

    it('doit échouer pour un domaine inexistant', async () => {
        await expect(checkCertificate('domaine.vraiment.inexistant.js'))
            .rejects.toThrow();
    });
});