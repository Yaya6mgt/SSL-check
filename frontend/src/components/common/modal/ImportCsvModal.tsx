import { useState, useRef } from 'react';
import { Modal } from "../Modal";
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}
const API_URL = import.meta.env.VITE_API_BASE_URL;

export function ImportCsvModal({ isOpen, onClose, onImportSuccess }: ImportCsvModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('token') || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/domains/import`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        onImportSuccess();
        onClose();
        setFile(null);
      } else {
        alert("Erreur lors de l'importation");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur réseau");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importer des domaines (CSV)">
      <div className="space-y-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".csv"
          />

          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload size={24} />
          </div>

          {file ? (
            <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
              <FileText size={18} />
              {file.name}
            </div>
          ) : (
            <>
              <p className="text-slate-700 font-bold">Cliquez pour choisir un fichier</p>
              <p className="text-slate-400 text-sm mt-1">Format attendu : server_name, ip_address, hostname</p>
            </>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
          <AlertCircle className="text-amber-500 shrink-0" size={20} />
          <p className="text-xs text-amber-700">
            L'importation va automatiquement créer les serveurs s'ils n'existent pas et lancer un premier scan SSL.
          </p>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 transition-all"
        >
          {uploading ? "Importation en cours..." : "Lancer l'importation"}
        </button>
      </div>
    </Modal>
  );
}