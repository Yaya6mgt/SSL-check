export interface DomainSuggestion {
  hostname: string;
  source: 'database' | 'reverse-dns';
}