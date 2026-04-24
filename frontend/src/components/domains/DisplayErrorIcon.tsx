import { useState } from 'react';
import { Globe, AlertTriangle, X } from 'lucide-react';
import { translateSslError } from '@/utils/error-ssl-translator';

export default function DisplayErrorIcon({ domain }: { domain: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isValid = domain.checks?.[0]?.isValid;

  return (
    <>
      <div className="flex items-center gap-3">
        {isValid ? (
          <Globe size={18} className="text-slate-400" />
        ) : (
          <div className="relative group">
            <AlertTriangle
              size={18}
              className="text-red-500 cursor-pointer animate-pulse"
              onClick={() => setIsModalOpen(true)}
            />

            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
              Cliquez pour voir l'erreur : {domain.checks?.[0]?.errorMessage}
            </div>
          </div>
        )}

        <span className={`font-mono font-bold ${isValid ? 'text-slate-700' : 'text-red-700'}`}>
          {domain.hostname}
        </span>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-red-50 p-6 flex items-center justify-between border-b border-red-100">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle size={24} />
                <h3 className="font-black uppercase tracking-tight">Détail de l'erreur</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Domaine concerné</label>
                <p className="font-mono font-bold text-slate-700">{domain.hostname}</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message technique</label>
                <div className="mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-red-600 font-mono text-sm wrap-break-words">
                  {translateSslError(domain.checks?.[0]?.errorMessage) || "Une erreur inconnue est survenue lors du check SSL."}
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full mt-8 py-3 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-colors shadow-lg shadow-slate-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}