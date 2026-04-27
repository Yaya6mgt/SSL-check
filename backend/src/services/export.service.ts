import { Domain } from '@/models/Domain';
import { SslCheck } from '@/models/SslCheck';
import { Server } from '@/models/Server';

export const generateDomainsCsv = async (serverId: number = 0) => {
  try {
    const domains = await Domain.findAll({
      ...(serverId > 0 ? { where: { serverId } } : {}),
      include: [
          {
            model: Server,
            as: 'server'
          },
          {
            model: SslCheck,
            as: 'checks',
            limit: 1,
            order: [['lastCheck', 'DESC']]
          }
      ]
    });

    const headers = ['Hostname', 'Serveur', 'IP', 'Statut', 'Expiration', 'Emetteur', 'Dernier Check', 'Erreur'];
    let csvContent = headers.join(',') + '\n';

    for (const domain of domains) {
      const lastCheck = domain.checks?.[0];

      const row = [
        `"${domain.hostname}"`,
        `"${domain.server?.name || 'N/A'}"`,
        `"${domain.server?.ipAddress || 'N/A'}"`,
        `"${lastCheck ? (lastCheck.isValid ? 'VALIDE' : 'ERREUR') : 'EN ATTENTE'}"`,
        `"${lastCheck?.validTo ? lastCheck.validTo.toISOString().split('T')[0] : 'N/A'}"`,
        `"${(lastCheck?.issuer || 'N/A').replace(/"/g, '""')}"`,
        `"${lastCheck?.lastCheck ? lastCheck.lastCheck.toISOString() : 'N/A'}"`,
        `"${(lastCheck?.errorMessage || '').replace(/,/g, ' ').replace(/"/g, '""')}"`
      ];

      csvContent += row.join(',') + '\n';
    }

    return csvContent;
  } catch (error) {
      console.error("Erreur génération CSV :", error);
      throw error;
  }
};

export const generateServersCsv = async () => {
  try {
    const servers = await Server.findAll({
      include: [{
        model: Domain,
        include: [{
          model: SslCheck,
          limit: 1,
          order: [['lastCheck', 'DESC']]
        }]
      }]
    });

    const headers = ['Serveur', 'IP', 'Nombre de domaines', 'Dernier Check'];
    let csvContent = headers.join(',') + '\n';

    for (const server of servers) {
      const lastCheck = server.domains?.[0]?.checks?.[0];

      const row = [
        `"${server.name}"`,
        `"${server.ipAddress}"`,
        `"${server.domains?.length || 0}"`,
        `"${lastCheck?.lastCheck ? lastCheck.lastCheck.toISOString() : 'N/A'}"`
      ];

      csvContent += row.join(',') + '\n';
    }

    return csvContent;
  } catch (error) {
      console.error("Erreur génération CSV :", error);
      throw error;
  }
};