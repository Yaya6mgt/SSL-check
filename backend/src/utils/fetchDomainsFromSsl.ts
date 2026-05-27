import tls from 'tls';

export const fetchDomainsFromSsl = (ipAddress: string, timeoutMs = 2500): Promise<string[]> => {
  return new Promise((resolve) => {
    const domains: string[] = [];

    const options = {
      host: ipAddress,
      port: 443,
      rejectUnauthorized: false,
      timeout: timeoutMs,
    };

    const socket = tls.connect(options, () => {
      try {
        const cert = socket.getPeerCertificate();

        if (cert && Object.keys(cert).length > 0) {
          if (cert.subject?.CN) {
            const cn = cert.subject.CN;
            if (Array.isArray(cn)) {
              domains.push(...cn.filter(c => typeof c === 'string'));
            } else if (typeof cn === 'string') {
              domains.push(cn);
            }
          }

          if (cert.subjectaltname) {
            const sans = cert.subjectaltname
              .split(',')
              .map(name => name.trim().replace(/^DNS:/i, ''))
              .filter(name => name.length > 0);

            domains.push(...sans);
          }
        }
      } catch (err) {
      } finally {
        socket.destroy();
      }
    });

    socket.on('timeout', () => {
      socket.destroy();
    });

    socket.on('error', () => {
      socket.destroy();
    });

    socket.on('close', () => {
      const domainsToIgnore = ['.invalid', '.local', '.example', 'localhost'];

      const cleanDomains = domains.map(d => d.toLowerCase().replace(/^\*\./, ''))
        .filter(d => !domainsToIgnore.some(ignored => d.endsWith(ignored)));
      resolve([...new Set(cleanDomains)]);
    });
  });
};
