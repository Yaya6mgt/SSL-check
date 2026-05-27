import { Modal } from "../Modal";
import DomainSuggestionsDropdown from "./DomainSuggestionsDropdown";

interface FormServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  serverData: { name: string, ipAddress: string };
  setServerData: React.Dispatch<React.SetStateAction<{ name: string, ipAddress: string }>>;
  isEdit?: boolean;
  serverId?: number | null;
  selectedHostnames: string[];
  onSelectedHostnamesChange: (hostnames: string[]) => void;
}

function FormServerModal({
  isOpen,
  onClose,
  title,
  onSubmit,
  loading,
  serverData,
  setServerData,
  isEdit = false,
  serverId = null,
  selectedHostnames,
  onSelectedHostnamesChange
}: FormServerModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || (isEdit ? "Modifier le serveur" : "Ajouter un serveur")}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nom du serveur</label>
          <input
            required
            type="text"
            placeholder="ex: Serveur Web Principal"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={serverData.name}
            onChange={e => setServerData({...serverData, name: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Adresse IP</label>
          <input
            required
            type="text"
            placeholder="ex: 192.168.1.1"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={serverData.ipAddress}
            onChange={e => setServerData({...serverData, ipAddress: e.target.value})}
          />
        </div>

        <DomainSuggestionsDropdown
          ipAddress={serverData.ipAddress}
          serverId={serverId}
          className="mt-2"
          selectedHostnames={selectedHostnames}
          onSelectedHostnamesChange={onSelectedHostnamesChange}
          hiddenSources={['database']}
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50 bg-secondary hover:bg-secondary-400`}
          >
            {loading
              ? (isEdit ? 'Modification...' : 'Création...')
              : (isEdit ? 'Enregistrer les modifications' : 'Confirmer l\'ajout')
            }
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default FormServerModal;