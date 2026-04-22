import { Router } from 'express';
import { Domain } from '@/models/Domain';
import { SslCheck } from '@/models/SslCheck';
import { Server } from '@/models/Server';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const servers = await Server.findAll({
      include: [{
        model: Domain,
        include: [{
          model: SslCheck,
          limit: 1,
          order: [['lastCheck', 'DESC']]
        }]
      }]
    });
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des serveurs" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const server = await Server.findByPk(req.params.id, {
      include: [{
        model: Domain,
        include: [{
          model: SslCheck,
          limit: 1,
          order: [['lastCheck', 'DESC']]
        }]
      }]
    });
    if (!server) return res.status(404).json({ error: "Serveur introuvable" });
    res.json(server);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération du serveur" });
  }
});

export default router;