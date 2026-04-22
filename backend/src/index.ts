import 'module-alias/register';
import express from 'express';
import fs from 'fs';
import { initScheduler } from '@/engine/scheduler';
import { connectDB } from './config/db';
import { importCsvData } from './services/import.service';

const app = express();
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

    app.get('/api/health', (req, res) => {
        res.json({ status: 'OK', message: 'SSL Monitor API is running' });
    });

    app.listen(PORT, () => {
        console.log(`Serveur hybride prêt sur le port ${PORT}`);
    });
  } catch (error) {
      console.error("Erreur au démarrage :", error);
      process.exit(1);
  }
}

startApp();