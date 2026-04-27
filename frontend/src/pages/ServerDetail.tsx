import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { calculateDays, getStatusConfig } from '@/utils/status';
import type { Domain } from '@/types/domain.type';
import type { IServer } from '@/types/server.type';
import { Plus, ArrowLeft, Trash2, Pencil, Download } from 'lucide-react';
import { fetchServer, updateServer } from '@/api/server.api';
import FormDomainModal from '@/components/common/modal/FormDomainModal';
import { checkDomain, deleteDomain, postDomain } from '@/api/domain.api';
import { RefreshButton } from '@/components/common/utils/RefreshButton';
import FormServerModal from '@/components/common/modal/FormServerModal';
import { DomainsFilters } from '@/components/filter/DomainsFilter';
import DisplayErrorIcon from '@/components/domains/DisplayErrorIcon';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function ServerDetail() {
  const { id } = useParams();
  const [server, setServer] = useState<IServer | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [isEditServerModalOpen, setIsEditServerModalOpen] = useState(false);
  const [editServerData, setEditServerData] = useState({ name: '', ipAddress: '' });
  const [updateLoading, setUpdateLoading] = useState(false);

  const [filterDays, setFilterDays] = useState<[number, number]>([0, 200]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VALID' | 'ERROR' | 'EXPIRING'>('ALL');


  const filteredDomains = server?.domains.filter(domain => {
    const days = calculateDays(domain.checks[0]?.validTo) ?? 0;
    const isValid = domain.checks[0]?.isValid;

    const matchesDays = (days >= filterDays[0] && days <= filterDays[1]) || !isValid;

    let matchesStatus = true;
    if (filterStatus === 'VALID') matchesStatus = isValid === true;
    if (filterStatus === 'ERROR') matchesStatus = isValid === false;
    if (filterStatus === 'EXPIRING') matchesStatus = days < 30 && isValid === true;

    return matchesDays && matchesStatus;
  });

  const sortedAndFiltered = filteredDomains?.sort((a, b) => {
    const daysA = calculateDays(a.checks[0]?.validTo) ?? 9999;
    const daysB = calculateDays(b.checks[0]?.validTo) ?? 9999;
    return daysA - daysB;
  });

  const handleDeleteDomain = async (domainId: number) => {
    await deleteDomain(domainId);
    fetchServer(Number(id), setServer, setLoading);
  };

  useEffect(() => {
    setLoading(true);
    fetchServer(Number(id), setServer, setLoading);
  }, [id]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await postDomain(newDomainName, id!);
      setIsModalOpen(false);
      setNewDomainName('');
      fetchServer(Number(id), setServer, setLoading);
    } catch (err) {
      alert("Erreur lors de l'ajout du domaine");
    } finally {
      setAddLoading(false);
    }
  };

  const handleManualCheck = async (domainId: number) => {
    setRefreshingId(domainId);

    try {
      const response = await checkDomain(domainId);
      if (!response || !response.check) throw new Error("Données de scan manquantes");

      const newCheck = response.check;

      setServer(prevServer => {
        if (!prevServer) return prevServer;

        return {
          ...prevServer,
          domains: prevServer.domains.map(domain => {
            if (domain.id === domainId) {
              return {
                ...domain,
                checks: [newCheck, ...(domain.checks || [])].slice(0, 5)
              };
            }
            return domain;
          })
        };
      });

    } catch (err) {
      console.error("Erreur lors du scan manuel:", err);
    } finally {
      setRefreshingId(null);
    }
  };

  const handleUpdateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      await updateServer(Number(id), editServerData.name, editServerData.ipAddress);

      setIsEditServerModalOpen(false);
      fetchServer(Number(id), setServer, setLoading);
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleExport = async (serverId: number) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/servers/${serverId}/export`, {
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
      a.download = `export-server-${serverId}-${new Date().toISOString().slice(0,10)}.csv`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error("Erreur export:", err);
    }
  };

  const openEditServerModal = () => {
    if (server) {
      setEditServerData({ name: server.name, ipAddress: server.ipAddress });
      setIsEditServerModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500 animate-pulse font-medium">Chargement...</p>
      </div>
    );
  }

  if (!server) return <div className="p-20 text-center">Serveur introuvable.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link to="/" className="text-primary hover:text-primary-hover font-medium flex items-center gap-2 mb-6 transition-colors">
        <ArrowLeft size={18} /> Retour au Dashboard
      </Link>

      <div className="bg-primary text-white p-8 rounded-2xl mb-8 shadow-lg flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{server.name}</h1>
            <button
              onClick={openEditServerModal}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-300 hover:text-white"
              title="Modifier le serveur"
            >
              <Pencil size={20} />
            </button>
          </div>
          <p className="text-slate-400 mt-2 font-mono">IP: {server.ipAddress}</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/20 cursor-pointer"
        >
          <Plus size={20} />
          Ajouter un domaine
        </button>
      </div>

      <DomainsFilters
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterDays={filterDays}
        setFilterDays={setFilterDays}
      />

      <div className="flex gap-2 mb-4">
        <button onClick={() => handleExport(server.id)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <Download size={16} />
          Exporter
        </button>
      </div>

      <div className="space-y-4">
        {sortedAndFiltered && sortedAndFiltered.length > 0 ? (
          sortedAndFiltered.map((domain: Domain) => {
            const isValid = domain.checks[0]?.isValid;
            const days = calculateDays(domain.checks[0]?.validTo);
            const config = getStatusConfig(days, domain.checks[0]?.isValid);

            return (
              <div key={domain.id} className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-red-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-2 flex row `}>
                    <RefreshButton
                        onClick={() => handleManualCheck(domain.id)}
                        isLoading={refreshingId === domain.id}
                        group={false}
                        className="px-2 py-2 border-transparent hover:border-secondary-100"
                      />
                    <button
                      onClick={() => handleDeleteDomain(domain.id)}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      title="Supprimer le domaine"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <DisplayErrorIcon domain={domain} />

                  <div>
                    <h3 className="text-lg font-mono font-bold text-slate-800">{domain.hostname}</h3>
                    <p className="text-sm text-slate-400">Émetteur: {domain.checks[0]?.issuer || 'Inconnu'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={`text-xl font-black ${config.color}`}>
                      {days !== null && isValid ? `${days} j` :  'N/A'}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Restants</p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border-2 font-bold text-sm ${config.bg} ${config.color} ${config.border}`}>
                    {config.label}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
             Aucun domaine enregistré pour ce serveur.
          </div>
        )}
      </div>

      <FormDomainModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        server={server}
        handleAddDomain={handleAddDomain}
        addLoading={addLoading}
        newDomainName={newDomainName}
        setNewDomainName={setNewDomainName}
      />
      <FormServerModal
        isOpen={isEditServerModalOpen}
        onClose={() => setIsEditServerModalOpen(false)}
        onSubmit={handleUpdateServer}
        loading={updateLoading}
        serverData={editServerData}
        setServerData={setEditServerData}
        isEdit
      />
    </div>
  );
}