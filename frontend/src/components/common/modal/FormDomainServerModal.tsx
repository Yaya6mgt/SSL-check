import type { IServer } from "@/types/server.type";
import { Modal } from "../Modal";
import type { NewDomainState } from "@/types/domain.type";
import CustomSelect from "@/components/ui/headless/CustomSelect";

interface FormDomainServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  handleAddDomain: (e: React.FormEvent<HTMLFormElement>) => void;
  newDomain: NewDomainState;
  setNewDomain: React.Dispatch<React.SetStateAction<NewDomainState>>;
  servers: IServer[];
}

function FormDomainServerModal({ isOpen, onClose, title, handleAddDomain, newDomain, setNewDomain, servers }: FormDomainServerModalProps) {
  const isCreatingNewServer = newDomain.serverId === "NEW_SERVER";

  const serverOptions = [
    ...servers.map(s => ({
      id: s.id,
      label: s.name,
      subLabel: s.ipAddress
    })),
    { id: "NEW_SERVER", label: "+ Ajouter un nouveau serveur", isSpecial: true }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || "Ajouter un domaine"}>
      <form onSubmit={handleAddDomain} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Nom d'hôte</label>
          <input
            required
            type="text"
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-secondary-300"
            placeholder="exemple.com"
            value={newDomain.hostname}
            onChange={e => setNewDomain({...newDomain, hostname: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Lier au serveur</label>
          <CustomSelect
            options={serverOptions}
            value={newDomain.serverId}
            placeholder="Sélectionner un serveur"
            onChange={(val) => setNewDomain({ ...newDomain, serverId: val })}
          />
        </div>

        {isCreatingNewServer && (
          <div className="p-4 bg-secondary-50 rounded-xl border border-blue-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">Nouveau Serveur</p>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nom du serveur</label>
              <input
                required
                type="text"
                placeholder="ex: Serveur Web"
                className="w-full p-2 bg-white border rounded-lg outline-none"
                value={newDomain.newServerName}
                onChange={e => setNewDomain({...newDomain, newServerName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Adresse IP</label>
              <input
                required
                type="text"
                placeholder="192.168..."
                className="w-full p-2 bg-white border rounded-lg outline-none"
                value={newDomain.newServerIp}
                onChange={e => setNewDomain({...newDomain, newServerIp: e.target.value})}
              />
            </div>
          </div>
        )}

        <button type="submit" className="w-full bg-secondary hover:bg-secondary-hover text-white py-3 rounded-lg font-bold cursor-pointer">
          {isCreatingNewServer
            ? "Créer le serveur et le domaine"
            : "Enregistrer le domaine"}
        </button>
      </form>
    </Modal>
  )
}

export default FormDomainServerModal;