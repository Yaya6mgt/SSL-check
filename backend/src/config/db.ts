import { Sequelize } from 'sequelize-typescript';
import { Server } from '@/models/Server';
import { Domain } from '@/models/Domain';
import { SslCheck } from '@/models/SslCheck';
import { Alert } from '@/models/Alert';
import { Recipient } from '@/models/Recipients';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  models: [Server, Domain, SslCheck, Alert, Recipient],
  logging: false,
  define: {
    underscored: true,
    timestamps: true
  }
});

export async function connectDB() {
    let connected = false;
    let attempts = 0;

    while (!connected && attempts < 10) {
        try {
            await sequelize.authenticate();
            console.log('Connexion à MySQL réussie !');
            await sequelize.sync({ alter: true });
            connected = true;
        } catch (error) {
            attempts++;
            console.log(`Attente de MySQL (tentative ${attempts}/10)...`);
            await new Promise(res => setTimeout(res, 5000));
        }
    }

    if (!connected) {
        throw new Error("Impossible de se connecter à la base de données après 10 tentatives.");
    }
}