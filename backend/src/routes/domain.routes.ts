import { Router } from 'express';
import { Domain } from '@/models/Domain';
import { SslCheck } from '@/models/SslCheck';
import { Server } from '@/models/Server';
import { checkCertificate } from '@/engine/ssl';
import { performAndSaveSslCheck } from '@/services/ssl.service';

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

    await performAndSaveSslCheck(newDomain);
    res.status(201).json(newDomain);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hostname, serverId } = req.body;

    const domain = await Domain.findByPk(id);

    if (!domain) {
      return res.status(404).json({ error: "Domaine non trouvé" });
    }

    await domain.update({
      hostname: hostname?.trim().toLowerCase() || domain.hostname,
      serverId: serverId || domain.serverId
    });

    await performAndSaveSslCheck(domain);

    res.json(domain);
  } catch (error: any) {
    console.error("Erreur modification domaine:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/check-all', async (req, res) => {
  try {
    const domains = await Domain.findAll();
    console.log(`[BATCH] Relance de ${domains.length} scans SSL...`);

    const results = [];
    for (const domain of domains) {
      const response = await performAndSaveSslCheck(domain);
      results.push({ hostname: domain.hostname, status: response.status, error: response.error || null });
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

router.post('/:id/check', async (req, res) => {
  try {
    const { id } = req.params;
    const domain = await Domain.findByPk(id);

    if (!domain) {
      return res.status(404).json({ error: "Domaine non trouvé" });
    }

    const response = await performAndSaveSslCheck(domain);
    res.status(200).json({
      message: response.status === 'success' ? "Scan terminé avec succès" : "Le scan a échoué",
      check: response.check,
    });
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