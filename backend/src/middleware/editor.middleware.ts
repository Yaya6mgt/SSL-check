import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const editorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: "Authentification requise." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    if (decoded && (decoded.role === 'editor' || decoded.role === 'admin')) {
      (req as any).user = decoded;
      next();
    } else {
      res.status(403).json({ error: "Accès interdit : privilèges minimum éditeur requis." });
    }
  } catch (error) {
    res.status(401).json({ error: "Token invalide ou expiré." });
  }
};