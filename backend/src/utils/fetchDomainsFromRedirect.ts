import http from 'http';

export const fetchDomainsFromRedirect = (ipAddress: string, timeoutMs = 1500): Promise<string[]> => {
  return new Promise((resolve) => {
    const options = {
      hostname: ipAddress,
      port: 80,
      path: '/',
      method: 'HEAD',
      timeout: timeoutMs,
    };

    const req = http.request(options, (res) => {
      const location = res.headers.location;
      if (location) {
        try {
          const url = new URL(location);
          resolve([url.hostname.replace(/^www\./i, '')]);
          return;
        } catch {
          resolve([]);
        }
      }
      resolve([]);
    });

    req.on('error', () => resolve([]));
    req.on('timeout', () => { req.destroy(); resolve([]); });
    req.end();
  });
};
