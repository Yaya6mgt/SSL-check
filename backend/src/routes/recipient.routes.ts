import { Request, Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { Recipient } from '@/models/Recipients';
import { editorMiddleware } from '@/middleware/editor.middleware';
import { User } from '@/models/User';

const router = Router();

interface AuthRequestProps extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

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

router.get('/exist', authMiddleware, async (req: AuthRequestProps, res) => {
  try {
    const userId = req.user?.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    const exists = await Recipient.findOne({ where: { email: user?.email } });
    res.json({ exists: !!exists });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la vérification de l'existence du destinataire." });
  }
});

router.post('/addme', authMiddleware, async (req: AuthRequestProps, res) => {
  try {
    const userId = req.user?.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    const [recipient, created] = await Recipient.findOrCreate({
      where: { email: user.email },
      defaults: { isActive: true }
    });

    if (!created) {
      return res.status(400).json({ error: "Vous êtes déjà inscrit en tant que destinataire." });
    }

    res.status(201).json({ id: recipient.id, email: recipient.email, isActive: recipient.isActive });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'ajout en tant que destinataire." });
  }
});

router.put('/toggleme', authMiddleware, async (req: AuthRequestProps, res) => {
  try {
    const userId = req.user?.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    const recipient = await Recipient.findOne({ where: { email: user.email } });
    if (!recipient) return res.status(404).json({ error: "Vous n'êtes pas inscrit en tant que destinataire." });

    recipient.isActive = !recipient.isActive;
    await recipient.save();
    res.json({ id: recipient.id, email: recipient.email, isActive: recipient.isActive });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour de votre statut de destinataire." });
  }
});

router.delete('/removeme', authMiddleware, async (req: AuthRequestProps, res) => {
  try {
    const userId = req.user?.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    const recipient = await Recipient.findOne({ where: { email: user.email } });
    if (!recipient) return res.status(404).json({ error: "Vous n'êtes pas inscrit en tant que destinataire." });

    await recipient.destroy();
    res.json({ message: "Vous avez été retiré des destinataires avec succès." });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression de votre inscription en tant que destinataire." });
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