import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateDays, getStatusConfig } from '@/utils/status';
import type { IServer } from '@/types/server.type';
import type { Domain } from '@/types/domain.type';
import { ApiError, apiFetch } from '@/utils/api';
import { ServerHealthBar } from '@/components/ServerHealthbar';
import { Server } from 'lucide-react';

export default function Dashboard() {
  const [servers, setServers] = useState<IServer[]>([]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const data = await apiFetch<IServer[]>(`servers`);
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
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <Server size={20} className={config.color} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {server.name}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${config.bg} ${config.color}`}>
                  {config.label}
                </span>
              </div>
              <div className="space-y-2 mt-2">
                <p className="text-sm text-slate-500">IP: {server.ipAddress}</p>
                <p className="text-sm font-medium text-slate-700">
                  {(server.domains || []).length} domaine(s) surveillé(s)
                </p>
                <ServerHealthBar domains={serverDomains} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}