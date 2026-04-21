import { Sequelize } from 'sequelize-typescript';
import { Server } from '@/models/Server';
import { Domain } from '@/models/Domain';
import { SslCheck } from '@/models/SslCheck';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  models: [Server, Domain, SslCheck],
  logging: false,
  define: {
    underscored: true,
    timestamps: true
  }
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Connexion à la BDD MySQL réussie avec Sequelize-Typescript.');
  } catch (error) {
    console.error('Impossible de se connecter à la BDD :', error);
    process.exit(1);
  }
};