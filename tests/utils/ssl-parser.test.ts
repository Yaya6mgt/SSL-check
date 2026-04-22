import { parseSANs } from '../../src/utils/ssl-parser';

describe('ssl-parser utility', () => {
  it('doit extraire les DNS correctement', () => {
    const input = "DNS:example.com, DNS:www.example.com";
    const result = parseSANs(input);
    expect(result).toEqual(['example.com', 'www.example.com']);
  });

  it('doit renvoyer un tableau vide si undefined', () => {
    expect(parseSANs(undefined)).toEqual([]);
  });
});