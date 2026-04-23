import { Modal } from "../Modal";

interface FormServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  handleAddServer: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  newServer: { name: string, ipAddress: string };
  setNewServer: React.Dispatch<React.SetStateAction<{ name: string, ipAddress: string }>>;
}

function FormServerModal({ isOpen, onClose, title, handleAddServer, loading, newServer, setNewServer }: FormServerModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || "Ajouter un serveur"}
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
  )
}

export default FormServerModal;