import { Request, Router } from 'express';
import { adminMiddleware } from '@/middleware/admin.middleware';
import { authMiddleware } from '@/middleware/auth.middleware';
import { User } from '@/models/User';

const router = Router();

interface AuthRequestProps extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

router.get('/', adminMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'firstName', 'lastName', 'email', 'role'] });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
  }
});

router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }
    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ error: `Rôle ${role} invalide. Les rôles valides sont : viewer, editor, admin.` });
    }
    const newUser = await User.create({ firstName, lastName, email, password, role });
    res.status(201).json({ id: newUser.id, firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email, role: newUser.role });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/me', authMiddleware, async (req: AuthRequestProps, res) => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, email, password } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    if (password) user.password = password;

    await user.save();
    res.json({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/me', authMiddleware, async (req: AuthRequestProps, res) => {
  try {
    const userId = req.user?.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    await user.destroy();
    res.json({ message: "Votre compte a été supprimé avec succès." });
  } catch (error: any) {
    res.status(500).json({ error: "Erreur lors de la suppression de votre compte." });
  }
});

router.put('/:id/role', adminMiddleware, async (req: AuthRequestProps, res) => {
  try {
    const authUserRole = req.user?.role;
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByPk(Number(id));
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ error: `Rôle ${role} invalide. Les rôles valides sont : viewer, editor, admin.` });
    }
    if (user.role === 'admin' && authUserRole !== 'super_admin') {
      return res.status(403).json({ error: "Accès interdit : seuls les super administrateurs peuvent modifier le rôle d'un administrateur." });
    }
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: "Accès interdit : les super administrateurs ne peuvent pas être modifiés." });
    }
    user.role = role || user.role;
    await user.save();
    res.json({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', adminMiddleware, async (req: AuthRequestProps, res) => {
  try {
    const authUserRole = req.user?.role;
    const { id } = req.params;
    const { firstName, lastName, email, password, role } = req.body;
    const user = await User.findByPk(Number(id));
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    if (user.role === 'admin' && authUserRole !== 'super_admin') {
      return res.status(403).json({ error: "Accès interdit : seuls les super administrateurs peuvent modifier un administrateur." });
    }
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: "Accès interdit : les super administrateurs ne peuvent pas être modifiés." });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    if (password) user.password = password;
    if (role) {
      if (!['viewer', 'editor', 'admin'].includes(role)) {
        return res.status(400).json({ error: `Rôle ${role} invalide. Les rôles valides sont : viewer, editor, admin.` });
      }
      user.role = role;
    }

    await user.save();
    res.json({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', adminMiddleware, async (req: AuthRequestProps, res) => {
  try {
    const authUserRole = req.user?.role;
    const { id } = req.params;
    const user = await User.findByPk(Number(id));
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    if (user.role === 'admin' && authUserRole !== 'super_admin') {
      return res.status(403).json({ error: "Accès interdit : seuls les super administrateurs peuvent supprimer un administrateur." });
    }
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: "Accès interdit : les super administrateurs ne peuvent pas être supprimés." });
    }

    await user.destroy();
    res.json({ message: "Utilisateur supprimé avec succès." });
  } catch (error: any) {
    res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur." });
  }
});

export default router;