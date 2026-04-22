import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateDays, getStatusConfig } from '@/utils/status';
import type { Server } from '@/type/server.type';
import type { Domain } from '@/type/domain.type';
import { ApiError, apiFetch } from '@/utils/api';

export default function Dashboard() {
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const data = await apiFetch<Server[]>(`servers`);
        setServers(data);
      } catch (err) {
        if (err instanceof ApiError) {
          console.error(`Erreur API (${err.status}):`, err.message);
        } else {
          console.error("Erreur inconnue:", err);
        }
      }
    };

    fetchServers();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Infrastructure SSL</h1>
        <p className="text-slate-500">Statut synthétique des serveurs Onlineformapro</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map(server => {
          const serverDomains = server.domains || [];

          const worstDays = serverDomains.length > 0
              ? Math.min(...serverDomains.map((d: Domain) => calculateDays(d.checks?.[0]?.validTo) || 999))
              : 999;

          const allValid = serverDomains.every((d: Domain) => d.checks?.[0]?.isValid !== false);
          const config = getStatusConfig(worstDays, allValid);

          return (
            <Link to={`/server/${server.id}`} key={server.id}
                  className="block p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-slate-800">{server.name}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${config.bg} ${config.color}`}>
                  {config.label}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-500">IP: {server.ipAddress}</p>
                <p className="text-sm font-medium text-slate-700">
                  {(server.domains || []).length} domaine(s) surveillé(s)
                </p>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-4">
                   <div className={`h-2 rounded-full ${config.bg.replace('100', '500')}`} style={{width: '100%'}}></div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}