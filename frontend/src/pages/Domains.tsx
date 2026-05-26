import { useEffect, useState } from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import { apiFetch } from '@/utils/api';
import { calculateDays } from '@/utils/status';
import { initialDomainState, type Domain, type NewDomainState } from '@/types/domain.type';
import type { IServer } from '@/types/server.type';
import FormDomainServerModal from '@/components/common/modal/FormDomainServerModal';
import { checkAllDomains, checkDomain, deleteDomain, fetchDomains, postDomain } from '@/api/domain.api';
import { fetchServers } from '@/api/server.api';
import { RefreshButton } from '@/components/common/utils/RefreshButton';
import { ImportCsvModal } from '@/components/common/modal/ImportCsvModal';
import { DomainsFilters } from '@/components/filter/DomainsFilter';
import { ServerFilter } from '@/components/filter/ServerFilter';
import TableDomains from '@/components/domains/TableDomains';
import SearchBar from '@/components/common/utils/SearchBar';
import { ResetButton } from '@/components/common/utils/ResetButton';

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
  const [filterDays, setFilterDays] = useState<[number, number]>([0, 200]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedServerIds, setSelectedServerIds] = useState<number[]>([]);

  const fetchData = async () => {
    fetchDomains(setDomains, setLoading);
    fetchServers(setServers, () => {});
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchServersIds = async () => {
      if (servers.length > 0) {
        setSelectedServerIds(servers.map(s => s.id));
      }
    };
    fetchServersIds();
  }, [servers]);

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
      console.log(domains)
    } catch (err) {
      console.error("Erreur lors du scan manuel:", err);
    } finally {
      setRefreshingId(null);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/domains/export`, {
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
      a.download = `export-domaines-${new Date().toISOString().slice(0,10)}.csv`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error("Erreur export:", err);
    }
  };

  const handleImportSuccess = () => {
    fetchData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && currentDomainId) {
      await handleEditDomain(e);
    } else {
      await handleAddDomain(e);
    }

    setIsModalOpen(false);
    await fetchData();
  };

  const handleResetFilter = () => {
    setSearch("");
    setSelectedServerIds(servers.map(s => s.id));
    setFilterStatus('ALL');
    setFilterDays([0, 200]);
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

  const filteredSearchDomains = domains.filter(d =>
    d.hostname.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDomains = filteredSearchDomains.filter(domain => {
    const days = calculateDays(domain.checks[0]?.validTo) ?? 0;
    const isValid = domain.checks[0]?.isValid;

    const matchesDays = (days >= filterDays[0] && days <= filterDays[1]) || !isValid
    const matchesServer = selectedServerIds.includes(domain.serverId);

    let matchesStatus = true;
    if (filterStatus === 'VALID') matchesStatus = isValid === true;
    if (filterStatus === 'ERROR') matchesStatus = isValid === false;
    if (filterStatus === 'EXPIRING') matchesStatus = days < 30 && isValid === true;

    return matchesDays && matchesStatus && matchesServer;
  });

  const sortedAndFiltered = filteredDomains?.sort((a, b) => {
    const daysA = calculateDays(a.checks[0]?.validTo) ?? 9999;
    const daysB = calculateDays(b.checks[0]?.validTo) ?? 9999;
    return daysA - daysB;
  });

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

      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un domaine..." className="mb-4" />

      <div className="flex items-center justify-between gap-4 mb-6">
        <ServerFilter
          servers={servers}
          selectedServerIds={selectedServerIds}
          onChange={setSelectedServerIds}
        />
        <ResetButton
          onClick={handleResetFilter}
          className="hidden md:inline-flex text-primary hover:text-secondary-active"
          size={24}
          group={true} />
      </div>
      <DomainsFilters
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterDays={filterDays}
        setFilterDays={setFilterDays}
      />
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

      <TableDomains
        domains={sortedAndFiltered}
        refreshingId={refreshingId}
        openEditModal={openEditModal}
        handleManualCheck={handleManualCheck}
        handleDeleteDomain={handleDeleteDomain}
      />

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