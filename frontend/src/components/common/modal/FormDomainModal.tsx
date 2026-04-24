import { Globe } from "lucide-react";
import { Modal } from "../Modal";
import type { IServer } from "@/types/server.type";

interface FormDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  server: IServer;
  handleAddDomain: (e: React.FormEvent<HTMLFormElement>) => void;
  addLoading: boolean;
  newDomainName: string;
  setNewDomainName: React.Dispatch<React.SetStateAction<string>>;
}

function FormDomainModal({ isOpen, onClose, title, server, handleAddDomain, addLoading, newDomainName, setNewDomainName }: FormDomainModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || "Nouveau domaine"}
    >
      <form onSubmit={handleAddDomain} className="space-y-4">
        <div className="bg-secondary-50 p-4 rounded-lg flex items-start gap-3 mb-4">
            <div className="text-secondary mt-0.5"><Globe size={18}/></div>
            <p className="text-xs text-secondary">
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
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary outline-none transition-all"
            value={newDomainName}
            onChange={e => setNewDomainName(e.target.value)}
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={addLoading}
            className="w-full bg-secondary text-white py-3 rounded-lg font-bold hover:bg-secondary-hover transition-colors disabled:opacity-50 cursor-pointer"
          >
            {addLoading ? 'Traitement...' : 'Ajouter le domaine'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default FormDomainModal;