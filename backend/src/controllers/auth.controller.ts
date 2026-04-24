import { Request, Response } from 'express';
import { User } from '@/models/User';
import { comparePassword, generateToken } from '@/utils/auth.utils';

export const login = async (req: Request, res: Response) => {
  try {
    console.log("Login Attempt:");
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email, isActive: true } });
    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    await user.update({ lastLogin: new Date() });

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'viewer'
    });

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ error: error.message });
  }
};
