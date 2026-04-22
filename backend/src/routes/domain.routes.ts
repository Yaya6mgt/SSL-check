import { Router } from 'express';
import { Domain } from '@/models/Domain';
import { SslCheck } from '@/models/SslCheck';
import { Server } from '@/models/Server';

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
    const newDomain = await Domain.create({ hostname, serverId });
    res.status(201).json(newDomain);
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