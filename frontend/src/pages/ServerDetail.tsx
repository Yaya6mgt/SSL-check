import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { calculateDays, getStatusConfig } from '@/utils/status';
import type { Domain } from '@/types/domain.type';
import type { IServer } from '@/types/server.type';
import { ApiError, apiFetch } from '@/utils/api';
import { Plus, ArrowLeft, Globe, Trash2 } from 'lucide-react';
import { Modal } from '@/components/common/Modal';

export default function ServerDetail() {
  const { id } = useParams();
  const [server, setServer] = useState<IServer | null>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchServer = async () => {
    try {
      const data = await apiFetch<IServer>(`servers/${id}`);
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

  const handleDeleteDomain = async (domainId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce domaine ?")) return;

    try {
      await apiFetch(`domains/${domainId}`, {
        method: 'DELETE',
      });
      fetchServer();
    } catch (err) {
      alert("Erreur lors de la suppression du domaine");
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchServer();
  }, [id]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await apiFetch('domains', {
        method: 'POST',
        body: {
            hostname: newDomainName,
            serverId: Number(id)
        }
      });
      setIsModalOpen(false);
      setNewDomainName('');
      fetchServer();
    } catch (err) {
      alert("Erreur lors de l'ajout du domaine");
    } finally {
      setAddLoading(false);
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
          <h1 className="text-3xl font-bold">{server.name}</h1>
          <p className="text-slate-400 mt-2">IP: {server.ipAddress}</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/20 cursor-pointer"
        >
          <Plus size={20} />
          Ajouter un domaine
        </button>
      </div>

      <div className="space-y-4">
        {server.domains && server.domains.length > 0 ? (
          server.domains.map((domain: Domain) => {
            const days = calculateDays(domain.checks[0]?.validTo);
            const config = getStatusConfig(days, domain.checks[0]?.isValid);

            return (
              <div key={domain.id} className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-red-100 transition-all">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleDeleteDomain(domain.id)}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                    title="Supprimer le domaine"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className={`p-2 rounded-lg bg-slate-50 text-slate-400`}>
                    <Globe size={20} />
                  </div>

                  <div>
                    <h3 className="text-lg font-mono font-bold text-slate-800">{domain.hostname}</h3>
                    <p className="text-sm text-slate-400">Émetteur: {domain.checks[0]?.issuer || 'Inconnu'}</p>
                  </div>
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
          })
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
             Aucun domaine enregistré pour ce serveur.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouveau domaine"
      >
        <form onSubmit={handleAddDomain} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 mb-4">
             <div className="text-blue-600 mt-0.5"><Globe size={18}/></div>
             <p className="text-xs text-blue-700">
                Le domaine sera automatiquement rattaché au serveur <strong>{server.name}</strong>.
             </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nom d'hôte (FQDN)</label>
            <input
              required
              autoFocus
              type="text"
              placeholder="ex: google.com"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={newDomainName}
              onChange={e => setNewDomainName(e.target.value)}
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={addLoading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {addLoading ? 'Traitement...' : 'Ajouter le domaine'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}