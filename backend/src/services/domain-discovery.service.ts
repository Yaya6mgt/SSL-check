import { promises as dns } from 'dns';
import { Domain } from '@/models/Domain';
import { Server } from '@/models/Server';

export type DomainSuggestion = {
  hostname: string;
  source: 'database' | 'reverse-dns';
};

export const suggestDomainsForIp = async (ipAddress: string): Promise<DomainSuggestion[]> => {
  const normalizedIpAddress = ipAddress.trim();

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

  const suggestions: DomainSuggestion[] = databaseDomains.map((domain) => ({
    hostname: domain.hostname,
    source: 'database'
  }));

  try {
    const reverseDnsNames = await dns.reverse(normalizedIpAddress);

    for (const hostname of reverseDnsNames) {
      suggestions.push({
        hostname: hostname.trim().toLowerCase(),
        source: 'reverse-dns'
      });
    }
  } catch {
    // Reverse DNS is best-effort only.
  }

  const uniqueSuggestions = new Map<string, DomainSuggestion>();

  for (const suggestion of suggestions) {
    if (!uniqueSuggestions.has(suggestion.hostname)) {
      uniqueSuggestions.set(suggestion.hostname, suggestion);
    }
  }

  return [...uniqueSuggestions.values()];
};