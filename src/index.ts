import 'module-alias/register';
import fs from 'fs';
import path from 'path/win32';
import { initScheduler } from '@/engine/scheduler';
import { connectDB } from './config/db';
import { importCsvData } from './services/import.service';

async function startApp() {
  console.log("Moniteur SSL démarré");
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
}

startApp();