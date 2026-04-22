import fs from 'fs';
import csv from 'csv-parser';
import { Server } from '@/models/Server';
import { Domain } from '@/models/Domain';

export const importCsvData = async (filePath: string) => {
  const results: any[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          for (const row of results) {
            const [server] = await Server.findOrCreate({
              where: { ipAddress: row.ip_address.trim() },
              defaults: { name: row.server_name.trim() }
            });

            await Domain.findOrCreate({
              where: { hostname: row.hostname.trim().toLowerCase() },
              defaults: { serverId: server.id }
            });
          }
          console.log(`Importation terminée : ${results.length} lignes traitées.`);
          resolve(true);
        } catch (error) {
          console.error('Erreur lors de l\'insertion en base:', error);
          reject(error);
        }
      });
  });
};