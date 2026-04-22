import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateDays, getStatusConfig } from '@/utils/status';
import type { IServer } from '@/types/server.type';
import type { Domain } from '@/types/domain.type';
import { ApiError, apiFetch } from '@/utils/api';
import { ServerHealthBar } from '@/components/ServerHealthbar';
import { Plus, Server, Trash2 } from 'lucide-react';
import { Modal } from '@/components/common/Modal';

export default function Dashboard() {
  const [servers, setServers] = useState<IServer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newServer, setNewServer] = useState({ name: '', ipAddress: '' });
  const [loading, setLoading] = useState(false);

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

  useEffect(() => { fetchServers(); }, []);

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('servers', {
        method: 'POST',
        body: newServer
      });
      setIsModalOpen(false);
      setNewServer({ name: '', ipAddress: '' });
      fetchServers();
    } catch (err) {
      alert("Erreur lors de l'ajout du serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteServer = async (e: React.MouseEvent, serverId: number, serverName: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Supprimer le serveur "${serverName}" et tous ses domaines ?`)) return;

    try {
      await apiFetch(`servers/${serverId}`, { method: 'DELETE' });
      fetchServers();
    } catch (err) {
      alert("Erreur lors de la suppression du serveur");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Infrastructure SSL</h1>
        <p className="text-slate-500">Statut synthétique des serveurs Onlineformapro</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center mt-2 gap-2 bg-secondary hover:bg-secondary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} />
          Nouveau Serveur
        </button>
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
            <div key={server.id} className="relative group">
              <button
                onClick={(e) => handleDeleteServer(e, server.id, server.name)}
                className="absolute top-4 right-4 z-10 p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
                title="Supprimer le serveur"
              >
                <Trash2 size={18} />
              </button>

              <Link
                to={`/server/${server.id}`}
                className="block p-6 bg-white rounded-3xl shadow-sm border border-slate-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 h-full"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-2xl ${config.bg} shadow-inner`}>
                    <Server size={24} className={config.color} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-800 leading-tight">
                      {server.name}
                    </h2>
                    <p className="text-xs font-mono text-slate-400 mt-1">{server.ipAddress}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500">
                      {serverDomains.length} domaine{serverDomains.length > 1 ? 's' : ''}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${config.bg} ${config.color} border border-current/10`}>
                      {config.label}
                    </span>
                  </div>

                  <div className="pt-2">
                    <ServerHealthBar domains={serverDomains} />
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter un serveur"
      >
        <form onSubmit={handleAddServer} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nom du serveur</label>
            <input
              required
              type="text"
              placeholder="ex: Serveur Web Principal"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={newServer.name}
              onChange={e => setNewServer({...newServer, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Adresse IP</label>
            <input
              required
              type="text"
              placeholder="ex: 192.168.1.1"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={newServer.ipAddress}
              onChange={e => setNewServer({...newServer, ipAddress: e.target.value})}
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Confirmer l\'ajout'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}