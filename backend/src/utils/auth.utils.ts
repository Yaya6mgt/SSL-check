import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: { id: number; email: string; role: string }): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_pour_dev';
  const expiresJWT = process.env.JWT_EXPIRES_IN || '24h';

  const options = {
    expiresIn: expiresJWT
  } as jwt.SignOptions;

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    secret,
    options
  );
};