import { promises as dns } from 'dns';
import { isIP } from 'net';
import { Domain } from '@/models/Domain';
import { Server } from '@/models/Server';
import { HttpError } from '@/utils/http-error';
import { fetchDomainsFromSsl } from '@/utils/fetchDomainsFromSsl';
import { fetchDomainsFromRedirect } from '@/utils/fetchDomainsFromRedirect';

export type DomainSuggestion = {
  hostname: string;
  source: 'database' | 'reverse-dns' | 'ssl-certificate' | 'redirect';
};

const sourcePriority = {
  'database': 1,
  'redirect': 2,
  'ssl-certificate': 3,
  'reverse-dns': 4
};

const reverseDnsWithTimeout = async (ip: string, timeoutMs = 2000): Promise<string[]> => {
  return Promise.race([
    dns.reverse(ip),
    new Promise<string[]>((_, reject) =>
      setTimeout(() => reject(new Error('DNS Timeout')), timeoutMs)
    )
  ]);
};

export const suggestDomainsForIp = async (ipAddress: string): Promise<DomainSuggestion[]> => {
  const normalizedIpAddress = ipAddress.trim();
  if (isIP(normalizedIpAddress) === 0) {
    throw new HttpError(400, 'Adresse IP invalide');
  }

  const suggestions: DomainSuggestion[] = [];
  const seenHostnames = new Set<string>();
  try {
    const databaseDomains = await Domain.findAll({
      attributes: ['hostname'],
      include: [{
        model: Server,
        attributes: [],
        where: { ipAddress: normalizedIpAddress },
        required: true
      }],
      order: [['hostname', 'ASC']]
    });

    for (const domain of databaseDomains) {
      const hostname = domain.hostname.trim().toLowerCase();
      if (!seenHostnames.has(hostname)) {
        seenHostnames.add(hostname);
        suggestions.push({ hostname, source: 'database' });
      }
    }
  } catch (dbError) {
    console.error('Erreur DB lors de la suggestion:', dbError);
  }

  try {
    const reverseDnsNames = await reverseDnsWithTimeout(normalizedIpAddress, 2000);

    for (const rawHostname of reverseDnsNames) {
      let hostname = rawHostname.trim().toLowerCase();
      if (hostname.endsWith('.')) {
        hostname = hostname.slice(0, -1);
      }

      if (!seenHostnames.has(hostname)) {
        seenHostnames.add(hostname);
        suggestions.push({ hostname, source: 'reverse-dns' });
      }
    }
  } catch (dnsError) {
    console.log(`Reverse DNS échoué pour ${normalizedIpAddress}:`, dnsError);
  }

  try {
    const sslDomains = await fetchDomainsFromSsl(normalizedIpAddress, 2500);

    for (const hostname of sslDomains) {
      if (!seenHostnames.has(hostname)) {
        seenHostnames.add(hostname);
        suggestions.push({
          hostname,
          source: 'ssl-certificate'
        });
      }
    }
  } catch (sslError) {
    console.log(`Échec de récupération des domaines depuis le certificat SSL:`, sslError);
  }

  try {
    const redirectDomains = await fetchDomainsFromRedirect(normalizedIpAddress, 2500);

    for (const hostname of redirectDomains) {
      if (!seenHostnames.has(hostname)) {
        seenHostnames.add(hostname);
        suggestions.push({
          hostname,
          source: 'redirect'
        });
      }
    }
  } catch (redirectError) {
    console.log(`Échec de récupération des domaines depuis les redirections:`, redirectError);
  }

  return suggestions.sort((a, b) => sourcePriority[a.source] - sourcePriority[b.source]);
};
