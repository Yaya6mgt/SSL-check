import 'reflect-metadata';
import { sequelize, connectDB } from '@/config/db';
import { exportStatusToCsv } from '@/services/export.service';
import path from 'path';

async function runExport() {
    console.log("Initialisation de l'exportation des données...");

    await connectDB();

    const exportPath = path.join(process.cwd(), 'data', 'export_status.csv');

    try {
        await exportStatusToCsv(exportPath);
        console.log(`Export terminé ! Fichier disponible ici : ${exportPath}`);
    } catch (err) {
        console.error("L'exportation a échoué.");
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

runExport();
