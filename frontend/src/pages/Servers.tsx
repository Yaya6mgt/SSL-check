import { checkDomain, deleteDomain, updateDomain } from "@/api/domain.api";
import { deleteServer, fetchServers, postServer, updateServer } from "@/api/server.api";
import FormDomainServerModal from "@/components/common/modal/FormDomainServerModal";
import FormServerModal from "@/components/common/modal/FormServerModal";
import SearchBar from "@/components/common/utils/SearchBar";
import TableServers from "@/components/servers/TableServers";
import type { Domain, NewDomainState } from "@/types/domain.type";
import { initialDomainState } from "@/types/domain.type";
import type { IServer } from "@/types/server.type";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function Servers() {
  const [servers, setServers] = useState<IServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isEditModal, setIsEditModal] = useState(false);

  const [isModalServerOpen, setIsModalServerOpen] = useState(false);
  const [isModalDomainOpen, setIsModalDomainOpen] = useState(false);
  const [editServerData, setEditServerData] = useState({
    name: "",
    ipAddress: ""
  });
  const [currentDomainId, setCurrentDomainId] = useState<number | null>(null);
  const [newDomain, setNewDomain] = useState<NewDomainState>(initialDomainState);
  const [selectedServerId, setSelectedServerId] = useState<number | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => { fetchServers(setServers, setLoading); }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900">Serveur</h1>
          <p className="text-slate-500">Chargement des serveurs...</p>
        </header>
      </div>
    );
  }

  const handleManualCheck = async (domainId: number) => {
    try {
      await checkDomain(domainId);
      fetchServers(setServers, setLoading);
    } catch (err) {
      console.error("Erreur lors de la vérification manuelle :", err);
      alert("Impossible de vérifier le domaine pour le moment.");
    }
  };

  const handleDeleteDomain = async (domainId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce domaine ?")) return;

    try {
      await deleteDomain(domainId);
      fetchServers(setServers, setLoading);
    } catch {
      alert("Erreur lors de la suppression du domaine");
    }
  };

  const handleServer = async (e: React.FormEvent) => {
    if (isEditModal) {
      await handleUpdateServer(e);
    } else {
      await handleAddServer(e);
    }
  };

  const handleEditDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentDomainId === null) throw new Error("ID du domaine non défini");
      await updateDomain(currentDomainId, newDomain.hostname, newDomain.serverId);
      fetchServers(setServers, setLoading);
      setIsModalDomainOpen(false);
      setNewDomain(initialDomainState);
    } catch (err) {
      console.error("Erreur lors de la création :", err);
      alert("Impossible de finaliser l'opération.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      await updateServer(selectedServerId!, editServerData.name, editServerData.ipAddress);

      setIsModalServerOpen(false);
      fetchServers(setServers, setLoading);
    } catch {
      alert("Erreur lors de la mise à jour");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postServer(editServerData.name, editServerData.ipAddress);
      setIsModalServerOpen(false);
      setEditServerData({ name: '', ipAddress: '' });
      fetchServers(setServers, setLoading);
    } catch {
      alert("Erreur lors de l'ajout du serveur");
    }
  };

  const openEditModal = (id: number) => {
    setSelectedServerId(id);
    const serverToEdit = servers.find(server => server.id === id);
    setEditServerData({
      name: serverToEdit?.name || "",
      ipAddress: serverToEdit?.ipAddress || ""
    });
    setIsEditModal(true);
    setIsModalServerOpen(true);
  };

  const openAddModal = () => {
    setEditServerData({ name: '', ipAddress: '' });
    setIsEditModal(false);
    setIsModalServerOpen(true);
  }

  const openEditDomainModal = (domain: Domain) => {
    setCurrentDomainId(domain.id);
    setSelectedServerId(domain.serverId);
    const domainToEdit = servers.find(server => server.id === domain.serverId)?.domains?.find(d => d.id === domain.id);
    if (domainToEdit) {
      setNewDomain({
        hostname: domainToEdit.hostname,
        serverId: domain.serverId.toString()
      });
      setIsModalDomainOpen(true);
    }
  };

  const handleDeleteServer = async (serverId: number) => {
    const serverToDelete = servers.find(server => server.id === serverId);
    if (!serverToDelete) return;

    if (!window.confirm(`Supprimer le serveur "${serverToDelete.name}" et tous ses domaines ?`)) return;

    try {
      await deleteServer(serverId);
      fetchServers(setServers, setLoading);
    } catch {
      alert("Erreur lors de la suppression du serveur");
    }
  };

  return (
  <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Tous les serveurs</h1>
          <p className="text-slate-500">{servers.length} serveurs enregistrés au total</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary-hover text-white rounded-xl font-bold transition-all active:scale-95 shadow-sm"
          >
            <Plus size={20} />
            Nouveau serveur
          </button>

        </div>
      </header>

      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un serveur..." className="mb-4" />

      <TableServers
        servers={servers.filter(server => server.name.toLowerCase().includes(search.toLowerCase()) || server.ipAddress.includes(search))}
        openEditModal={openEditModal}
        handleDeleteServer={handleDeleteServer}
        domainActions={{
          refreshingId: null,
          openEditModal: openEditDomainModal,
          handleManualCheck: handleManualCheck,
          handleDeleteDomain: handleDeleteDomain
        }}
      />

      <FormServerModal
        isOpen={isModalServerOpen}
        onClose={() => setIsModalServerOpen(false)}
        onSubmit={handleServer}
        loading={updateLoading}
        serverData={editServerData}
        setServerData={setEditServerData}
        isEdit={isEditModal}
      />

      <FormDomainServerModal
        isOpen={isModalDomainOpen}
        onClose={() => setIsModalDomainOpen(false)}
        title="Modifier le domaine"
        handleSubmit={handleEditDomain}
        newDomain={newDomain}
        setNewDomain={setNewDomain}
        servers={servers}
        isEdit={true}
      />
    </div>
  );
}
