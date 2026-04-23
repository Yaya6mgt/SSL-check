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

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ipAddress } = req.body;

    const server = await Server.findByPk(id);

    if (!server) {
      return res.status(404).json({ error: "Serveur non trouvé" });
    }

    await server.update({
      name: name?.trim() || server.name,
      ipAddress: ipAddress?.trim() || server.ipAddress
    });

    res.json(server);
  } catch (error: any) {
    console.error("Erreur modification serveur:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, ipAddress } = req.body;
    if (!name || !ipAddress) {
      return res.status(400).json({ error: "Nom et IP requis" });
    }
    const newServer = await Server.create({ name, ipAddress });
    res.status(201).json(newServer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Server.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Serveur non trouvé" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;