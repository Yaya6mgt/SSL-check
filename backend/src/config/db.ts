import { Sequelize } from 'sequelize-typescript';
import { Server } from '@/models/Server';
import { Domain } from '@/models/Domain';
import { SslCheck } from '@/models/SslCheck';
import { Alert } from '@/models/Alert';
import dotenv from 'dotenv';
import { User } from '@/models/User';
import { Recipient } from '@/models/Recipients';
import { AlertThresholdSetting } from '@/models/AlertThresholdSetting';
import { AlertEmailTemplateSetting } from '@/models/AlertEmailTemplateSetting';

dotenv.config();

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
    models: [Server, Domain, SslCheck, Alert, User, Recipient, AlertThresholdSetting, AlertEmailTemplateSetting],
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
      await sequelize.sync({ alter: true });
      console.log('Connexion à MySQL réussie et schéma synchronisé !');
      connected = true;
    } catch (error) {
      const dbError = error as { code?: string; original?: { code?: string } };
      if (dbError.code === 'ER_TOO_MANY_KEYS' || dbError.original?.code === 'ER_TOO_MANY_KEYS') {
        throw new Error("La synchronisation du schéma a échoué à cause de trop d'index MySQL sur une table. Supprime le volume de la base de données ou nettoie les index en trop, puis relance Docker.");
       } else {
        attempts++;
        console.error(`Échec MySQL ou synchronisation (tentative ${attempts}/10) :`, error);
        console.log('Nouvelle tentative dans 5 secondes...');
        await new Promise(res => setTimeout(res, 5000));
      }
    }
    if (!connected) {
        throw new Error("Impossible de se connecter à la base de données après 10 tentatives.");
    }
  }
}