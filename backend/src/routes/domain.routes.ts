import { Router } from 'express';
import { Domain } from '@/models/Domain';
import { SslCheck } from '@/models/SslCheck';
import { Server } from '@/models/Server';
import { checkCertificate } from '@/engine/ssl';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const domains = await Domain.findAll({
            include: [
                { model: Server },
                {
                    model: SslCheck,
                    limit: 1,
                    order: [['lastCheck', 'DESC']]
                }
            ]
        });
        res.json(domains);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des domaines" });
    }
});

router.post('/', async (req, res) => {
  try {
    console.log("Requête reçue pour créer un domaine avec les données:", req.body);
    const { hostname, serverId } = req.body;
    if (!hostname || !serverId) {
      return res.status(400).json({ error: "Hostname et ServerId requis" });
    }
    const newDomain = await Domain.create({
      hostname: hostname.trim().toLowerCase(),
      serverId
    });

    try {
      const result = await checkCertificate(newDomain.hostname);

      await SslCheck.create({
        domainId: newDomain.id,
        isValid: result.isValid,
        validTo: result.validTo,
        issuer: result.issuer,
        lastCheck: new Date(),
        errorMessage: null
      });

      console.log(`Premier scan réussi pour le nouveau domaine : ${newDomain.hostname}`);
    } catch (scanError: any) {
      await SslCheck.create({
        domainId: newDomain.id,
        isValid: false,
        lastCheck: new Date(),
        errorMessage: scanError.message
      });

      console.log(`Premier scan échoué pour : ${newDomain.hostname} (${scanError.message})`);
    }
    res.status(201).json(newDomain);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check pour tout les domaines
router.post('/check-all', async (req, res) => {
  try {
    const domains = await Domain.findAll();
    console.log(`[BATCH] Relance de ${domains.length} scans SSL...`);

    const results = [];
    for (const domain of domains) {
      try {
        const result = await checkCertificate(domain.hostname);
        const check = await SslCheck.create({
          domainId: domain.id,
          isValid: result.isValid,
          validTo: result.validTo,
          issuer: result.issuer,
          lastCheck: new Date(),
          errorMessage: null
        });
        results.push({ hostname: domain.hostname, status: 'success' });
      } catch (scanError: any) {
        await SslCheck.create({
          domainId: domain.id,
          isValid: false,
          lastCheck: new Date(),
          errorMessage: scanError.message
        });
        results.push({ hostname: domain.hostname, status: 'failed', error: scanError.message });
      }
    }

    res.status(200).json({
      message: "Scan global terminé",
      processed: domains.length,
      details: results
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check pour un domaine spécifique
router.post('/:id/check', async (req, res) => {
  try {
    const { id } = req.params;
    const domain = await Domain.findByPk(id);

    if (!domain) {
      return res.status(404).json({ error: "Domaine non trouvé" });
    }

    try {
      const result = await checkCertificate(domain.hostname);

      const newCheck = await SslCheck.create({
        domainId: domain.id,
        isValid: result.isValid,
        validTo: result.validTo,
        issuer: result.issuer,
        lastCheck: new Date(),
        errorMessage: null
      });

      res.status(200).json({
        message: "Scan terminé avec succès",
        check: newCheck
      });
    } catch (scanError: any) {
      const failedCheck = await SslCheck.create({
        domainId: domain.id,
        isValid: false,
        lastCheck: new Date(),
        errorMessage: scanError.message
      });

      res.status(200).json({
        message: "Le scan a échoué",
        check: failedCheck
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Domain.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Domaine non trouvé" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;