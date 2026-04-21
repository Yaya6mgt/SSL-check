export function parseSANs(altNames: string | undefined): string[] {
    if (!altNames) return [];

    return altNames
        .split(',')
        .map(name => name.trim().replace(/^DNS:/, ''))
        .filter(name => name.length > 0);
}
