import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { calculateDays, getStatusConfig } from '@/utils/status';
import type { Domain } from '@/type/domain.type';
import type { Server } from '@/type/server.type';
import { ApiError, apiFetch } from '@/utils/api';

export default function ServerDetail() {
  const { id } = useParams();
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchServer = async () => {
      try {
        const data = await apiFetch<Server>(`servers/${id}`);
        setServer(data);
      } catch (err) {
        if (err instanceof ApiError) {
          console.error(`Erreur API (${err.status}):`, err.message);
        } else {
          console.error("Erreur inconnue:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchServer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500 animate-pulse font-medium">Chargement des données serveur...</p>
      </div>
    );
  }

  if (!server) {
    return <div className="p-20 text-center">Serveur introuvable.</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 mb-6">
        ← Retour au Dashboard
      </Link>

      <div className="bg-slate-900 text-white p-8 rounded-2xl mb-8 shadow-lg">
        <h1 className="text-3xl font-bold">{server.name}</h1>
        <p className="text-slate-400 mt-2">Détail des domaines pour {server.ipAddress}</p>
      </div>

      <div className="space-y-4">
        {server.domains?.map((domain: Domain) => {
          const days = calculateDays(domain.checks[0]?.validTo);
          const config = getStatusConfig(days, domain.checks[0]?.isValid);

          return (
            <div key={domain.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-mono font-bold text-slate-800">{domain.hostname}</h3>
                <p className="text-sm text-slate-400">Émetteur: {domain.checks[0]?.issuer || 'Inconnu'}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className={`text-xl font-black ${config.color}`}>
                    {days !== null ? `${days} j` : 'N/A'}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Restants</p>
                </div>
                <div className={`px-4 py-2 rounded-lg border-2 font-bold text-sm ${config.bg} ${config.color} ${config.border}`}>
                  {config.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}