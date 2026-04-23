import { useEffect, useState } from 'react';
import { Globe, Plus, Search, Trash2, Pencil, Download, Upload } from 'lucide-react';
import { apiFetch } from '@/utils/api';
import { calculateDays, getStatusConfig } from '@/utils/status';
import { initialDomainState, type Domain, type NewDomainState } from '@/types/domain.type';
import type { IServer } from '@/types/server.type';
import FormDomainServerModal from '@/components/common/modal/FormDomainServerModal';
import { checkAllDomains, checkDomain, deleteDomain, fetchDomains, postDomain } from '@/api/domain.api';
import { fetchServers } from '@/api/server.api';
import { RefreshButton } from '@/components/common/RefreshButton';
import { ImportCsvModal } from '@/components/common/modal/ImportCsvModal';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function Domains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [servers, setServers] = useState<IServer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDomain, setNewDomain] = useState<NewDomainState>(initialDomainState);
  const [isGlobalRefreshing, setIsGlobalRefreshing] = useState(false);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [currentDomainId, setCurrentDomainId] = useState<number | null>(null);
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  const fetchData = async () => {
    fetchDomains(setDomains, setLoading);
    fetchServers(setServers, () => {});
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalServerId = newDomain.serverId;

      if (newDomain.serverId === "NEW_SERVER") {
        const createdServer = await apiFetch<IServer>('servers', {
          method: 'POST',
          body: {
            name: newDomain.newServerName,
            ipAddress: newDomain.newServerIp
          }
        });

        finalServerId = createdServer.id.toString();
      }

      await postDomain(newDomain.hostname, finalServerId!);

      setIsModalOpen(false);
      setNewDomain(initialDomainState);
      fetchData();

    } catch (err) {
      console.error("Erreur lors de la création :", err);
      alert("Impossible de finaliser l'opération.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalServerId = newDomain.serverId;

      if (newDomain.serverId === "NEW_SERVER") {
        const createdServer = await apiFetch<IServer>('servers', {
          method: 'POST',
          body: {
            name: newDomain.newServerName,
            ipAddress: newDomain.newServerIp
          }
        });

        finalServerId = createdServer.id.toString();
      }

      await apiFetch(`domains/${currentDomainId}`, {
        method: 'PUT',
        body: { hostname: newDomain.hostname, serverId: finalServerId }
      });

      setIsModalOpen(false);
      setNewDomain(initialDomainState);
      fetchData();

    } catch (err) {
      console.error("Erreur lors de la création :", err);
      alert("Impossible de finaliser l'opération.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDomain = async (domainId: number) => {
    await deleteDomain(domainId);
    fetchDomains(setDomains, () => {});
  }

  const handleCheckAll = async () => {
    setIsGlobalRefreshing(true);
    try {
      await checkAllDomains();
      fetchDomains(setDomains, () => {});
    } catch (err) {
      console.error("Erreur lors du scan global:", err);
    } finally {
      setIsGlobalRefreshing(false);
    }
  };

  const handleManualCheck = async (domainId: number) => {
    setRefreshingId(domainId);

    try {
      const response = await checkDomain(domainId);
      if (!response) throw new Error("Aucune réponse du serveur");
      const newCheck = response.check;
      setServers(prevServers => prevServers.map(server => {
        return {
          ...server,
          domains: server.domains.map(domain => {
            if (domain.id === domainId) {
              return {
                ...domain,
                checks: [newCheck, ...(domain.checks || [])].slice(0, 5)
              };
            }
            return domain;
          })
        };
      }));

    } catch (err) {
      console.error("Erreur lors du scan manuel:", err);
    } finally {
      setRefreshingId(null);
    }
  };

  const handleExport = async () => {
    try {
      window.location.href = `${API_URL}/domains/export`;

    } catch (err) {
      alert("Erreur lors de l'export");
    }
  };

  const handleImportSuccess = () => {
    fetchData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && currentDomainId) {
      handleEditDomain(e);
    } else {
      await handleAddDomain(e);
    }

    setIsModalOpen(false);
    fetchData();
  };

  const openEditModal = (domain: Domain) => {
    setIsEdit(true);
    setCurrentDomainId(domain.id);
    setNewDomain({
      hostname: domain.hostname,
      serverId: domain.serverId.toString(),
      newServerName: '',
      newServerIp: ''
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setIsEdit(false);
    setNewDomain(initialDomainState);
    setIsModalOpen(true);
  };

  const filteredDomains = domains.filter(d =>
    d.hostname.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900">Tous les domaines</h1>
        <p className="text-slate-500">Chargement en cours...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Tous les domaines</h1>
          <p className="text-slate-500">{domains.length} domaines enregistrés au total</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary-hover text-white rounded-xl font-bold transition-all active:scale-95 shadow-sm"
          >
            <Plus size={20} />
            Nouveau domaine
          </button>

          <RefreshButton
            label="Tout scanner"
            onClick={handleCheckAll}
            isLoading={isGlobalRefreshing}
            className='min-w-45'
          />
        </div>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher un domaine..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <Download size={16} />
          Exporter
        </button>
        <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <Upload size={16} />
          Importer
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold uppercase text-slate-500">Domaine</th>
              <th className="p-4 text-xs font-bold uppercase text-slate-500">Serveur</th>
              <th className="p-4 text-xs font-bold uppercase text-slate-500">Expiration</th>
              <th className="p-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDomains.map(domain => {
              const days = calculateDays(domain.checks?.[0]?.validTo);
              const config = getStatusConfig(days, domain.checks?.[0]?.isValid);
              return (
                <tr key={domain.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Globe size={18} className="text-slate-400" />
                      <span className="font-mono font-bold text-slate-700">{domain.hostname}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {domain.server?.name || 'Non lié'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${config.bg.replace('100', '500')}`} />
                      <span className={`text-sm font-bold ${config.color}`}>
                        {days !== null ? `${days} jours` : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <div className="inline-flex items-center gap-1 px-2 py-1">
                      <button
                        onClick={() => openEditModal(domain)}
                        className="p-2 text-slate-400 hover:text-primary transition-colors mr-3"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteDomain(domain.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors mr-3"
                      >
                        <Trash2 size={18} />
                      </button>
                      <RefreshButton
                        onClick={() => handleManualCheck(domain.id)}
                        isLoading={refreshingId === domain.id}
                        group={false}
                        className="px-2 py-2 border-transparent hover:border-secondary-100"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <FormDomainServerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? "Modifier le domaine" : "Ajouter un domaine"}
        handleSubmit={handleSubmit}
        newDomain={newDomain}
        setNewDomain={setNewDomain}
        servers={servers}
        isEdit={isEdit}
      />
      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}