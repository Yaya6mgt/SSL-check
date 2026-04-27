import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateDays, getStatusConfig } from '@/utils/status';
import type { IServer } from '@/types/server.type';
import type { Domain } from '@/types/domain.type';
import { apiFetch } from '@/utils/api';
import { ServerHealthBar } from '@/components/ServerHealthbar';
import { Download, Plus, Server, Trash2 } from 'lucide-react';
import { fetchServers } from '@/api/server.api';
import FormServerModal from '@/components/common/modal/FormServerModal';
import { ServerFilter } from '@/components/filter/ServerFilter';
import SearchBar from '@/components/common/utils/SearchBar';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function Dashboard() {
  const [servers, setServers] = useState<IServer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newServer, setNewServer] = useState({ name: '', ipAddress: '' });
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedServerIds, setSelectedServerIds] = useState<number[]>([]);

  useEffect(() => { fetchServers(setServers, setLoading); }, []);

  useEffect(() => {
    if (servers.length > 0) {
      setSelectedServerIds(servers.map(s => s.id));
    }
  }, [servers]);


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
      fetchServers(setServers, setLoading);
    } catch (err) {
      alert("Erreur lors de l'ajout du serveur");
    }
  };

  const handleDeleteServer = async (e: React.MouseEvent, serverId: number, serverName: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Supprimer le serveur "${serverName}" et tous ses domaines ?`)) return;

    try {
      await apiFetch(`servers/${serverId}`, { method: 'DELETE' });
      fetchServers(setServers, setLoading);
    } catch (err) {
      alert("Erreur lors de la suppression du serveur");
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/servers/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors de l\'export');

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-servers-${new Date().toISOString().slice(0,10)}.csv`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error("Erreur export:", err);
    }
  };

  const filteredServers = servers.filter(server => {
    const matchesServer = selectedServerIds.includes(server.id);
    const matchesSearch = server.name.toLowerCase().includes(search.toLowerCase()) || server.ipAddress.includes(search);

    return matchesServer && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900">Infrastructure SSL</h1>
          <p className="text-slate-500">Statut synthétique des serveurs Onlineformapro</p>
        </header>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Infrastructure SSL</h1>
        <p className="text-slate-500">Statut synthétique des serveurs Onlineformapro</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center mt-2 gap-2 bg-secondary hover:bg-secondary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-secondary-200 active:scale-95 cursor-pointer"
        >
          <Plus size={20} />
          Nouveau Serveur
        </button>
      </header>

      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un serveur..." className="mb-4" />
      <div className="flex items-center gap-4 mb-6">
        <ServerFilter
          servers={servers}
          selectedServerIds={selectedServerIds}
          onChange={setSelectedServerIds}
        />
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <Download size={16} />
          Exporter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(filteredServers) ? (
          filteredServers.map(server => {
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
          })
        ) : (
          <div className="col-span-full text-center py-10 text-slate-400">
            Chargement des serveurs ou données invalides...
          </div>
        )}
      </div>
      <FormServerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddServer}
        loading={loading}
        serverData={newServer}
        setServerData={setNewServer}
      />
    </div>
  );
}