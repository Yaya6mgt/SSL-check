import { Router } from 'express';
import { Domain } from '@/models/Domain';
import { SslCheck } from '@/models/SslCheck';
import { Server } from '@/models/Server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { editorMiddleware } from '@/middleware/editor.middleware';
import { generateDomainsCsv, generateServersCsv } from '@/services/export.service';
import { suggestDomainsForIp } from '@/services/domain-discovery.service';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
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

router.post('/', editorMiddleware, async (req, res) => {
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

router.get('/suggest-domains', authMiddleware, async (req, res) => {
  try {
    const ipAddress = typeof req.query.ipAddress === 'string' ? req.query.ipAddress.trim() : '';
    console.log("Recherche de suggestions pour l'IP:", ipAddress);

    if (!ipAddress) {
      return res.status(400).json({ error: 'IP address requis' });
    }
    const suggestions = await suggestDomainsForIp(ipAddress);

    res.json({
      ipAddress,
      suggestions
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des suggestions de domaines"  });
  }
});

router.get('/export', authMiddleware, async (req, res) => {
  try {
    const csvData = await generateServersCsv();

    const fileName = `export-servers-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    return res.status(200).send(csvData);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'export" });
  }
});

router.get('/:id/export', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const csvData = await generateDomainsCsv(Number(id));

    const fileName = `export-server-${id}-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    return res.status(200).send(csvData);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'export" });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const server = await Server.findByPk(Number(id), {
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

router.put('/:id', editorMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ipAddress } = req.body;

    const server = await Server.findByPk(Number(id));

    if (!server) {
      return res.status(404).json({ error: "Serveur non trouvé" });
    }

    await server.update({
      name: name?.trim() || server.name,
      ipAddress: ipAddress?.trim() || server.ipAddress
    });
    console.log("Serveur mis à jour:", server.toJSON());
    res.json(server);
  } catch (error: any) {
    console.error("Erreur modification serveur:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', editorMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Server.destroy({ where: { id: Number(id) } });
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