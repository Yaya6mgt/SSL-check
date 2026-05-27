import fs from 'fs';
import csv from 'csv-parser';
import { Server } from '@/models/Server';
import { Domain } from '@/models/Domain';
import { performAndSaveSslCheck } from '@/services/ssl.service';

const getServerNameFromHostname = (hostname: string) => {
  const normalizedHostname = hostname.trim().toLowerCase();
  const rootName = normalizedHostname.replace(/\.[^.]+$/, '');

  return rootName || normalizedHostname;
};

export const importCsvData = async (filePath: string) => {
  const results: any[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('error', (err) => reject(err))
      .on('end', async () => {
        try {
          for (const row of results) {
            const hostname = row.hostname.trim().toLowerCase();
            const serverName = row.server_name?.trim() || getServerNameFromHostname(hostname);

            const [server] = await Server.findOrCreate({
              where: { ipAddress: row.ip_address.trim() },
              defaults: { name: serverName }
            });

            const [domain, created] = await Domain.findOrCreate({
              where: { hostname },
              defaults: { serverId: server.id }
            });

            if (created) {
               await performAndSaveSslCheck(domain);
            }
          }

          fs.unlinkSync(filePath);

          resolve({ count: results.length });
        } catch (error) {
          console.error('Erreur lors de l\'insertion en base:', error);
          reject(error);
        }
      });
  });
};