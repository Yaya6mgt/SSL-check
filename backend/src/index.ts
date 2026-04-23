import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { initScheduler } from '@/engine/scheduler';
import { connectDB, sequelize } from './config/db';
import { importCsvData } from './services/import.service';
import domainRoutes from './routes/domain.routes';
import serverRoutes from './routes/server.routes';

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(express.json());

async function startApp() {
  try {
    await connectDB();
    const csvPath = '/app/data/inventory.csv';

    console.log(`Recherche du CSV ici : ${csvPath}`);

    if (fs.existsSync(csvPath)) {
        console.log("Fichier trouvé ! Lancement de l'import...");
        await importCsvData(csvPath);
    } else {
        console.error(`Erreur : Le fichier ${csvPath} est introuvable.`);
        if (fs.existsSync('/app')) {
            console.log("Contenu de /app :", fs.readdirSync('/app'));
        }
    }
    initScheduler();

    app.use('/api/domains', domainRoutes);
    app.use('/api/servers', serverRoutes);

    app.listen(PORT, () => {
        console.log(`Serveur hybride prêt sur le port ${PORT}`);
    });
  } catch (error) {
      console.error("Erreur au démarrage :", error);
      process.exit(1)
  }
}

startApp();