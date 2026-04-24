import { Request, Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { Recipient } from '@/models/Recipients';
import { editorMiddleware } from '@/middleware/editor.middleware';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const recipients = await Recipient.findAll({ attributes: ['id', 'email', 'isActive'] });
    res.json(recipients);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des destinataires." });
  }
});

router.post('/', editorMiddleware, async (req, res) => {
  try {
    const { email, isActive } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }
    const recipient = await Recipient.create({  email, isActive: isActive || true });
    res.status(201).json({ id: recipient.id, email: recipient.email, isActive: recipient.isActive });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', editorMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const recipient = await Recipient.findByPk(Number(id));
    if (!recipient) return res.status(404).json({ error: "Destinataire introuvable." });

    recipient.isActive = isActive;
    await recipient.save();
    res.json({ id: recipient.id, email: recipient.email, isActive: recipient.isActive });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', editorMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const recipient = await Recipient.findByPk(Number(id));
    if (!recipient) return res.status(404).json({ error: "Destinataire introuvable." });

    await recipient.destroy();
    res.json({ message: "Destinataire supprimé avec succès." });
  } catch (error: any) {
    res.status(500).json({ error: "Erreur lors de la suppression du destinataire." });
  }
});

export default router;