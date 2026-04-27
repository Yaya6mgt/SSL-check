import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { initScheduler } from '@/engine/scheduler';
import { connectDB, sequelize } from './config/db';
import { importCsvData } from './services/import.service';
import domainRoutes from './routes/domain.routes';
import serverRoutes from './routes/server.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import recipientRoutes from './routes/recipient.routes';

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(express.json());

async function startApp() {
  try {
    await connectDB();
    const csvPath = '/app/data/data.csv';

    console.log(`Recherche du CSV ici : ${csvPath}`);

    if (fs.existsSync(csvPath)) {
        console.log("Fichier trouvé ! Lancement de l'import...");
        await importCsvData(csvPath);
    } else {
        console.error(`Aucun fichier trouvé : Le fichier ${csvPath} est introuvable.`);
        if (fs.existsSync('/app/data')) {
            console.log("Contenu de /app/data :", fs.readdirSync('/app/data'));
        }
    }
    initScheduler();

    app.use('/api/domains', domainRoutes);
    app.use('/api/servers', serverRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/recipients', recipientRoutes);

    app.listen(PORT, () => {
        console.log(`Serveur hybride prêt sur le port ${PORT}`);
    });
  } catch (error) {
      console.error("Erreur au démarrage :", error);
      process.exit(1)
  }
}

startApp();