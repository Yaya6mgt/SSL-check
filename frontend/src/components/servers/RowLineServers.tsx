import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import type { IServer } from "@/types/server.type";
import { calculateDays } from "@/utils/status";

interface RowLineServersProps {
  server: IServer;
  openEditModal: (id: number) => void;
  handleDeleteServer: (serverId: number) => void;
  onRowClick: () => void;
  isExpanded: boolean;
  gridLayout: string;
}

function RowLineServers({
  server,
  openEditModal,
  handleDeleteServer,
  onRowClick,
  isExpanded,
  gridLayout
}: RowLineServersProps) {
  const domains = server.domains || [];

  const stats = domains.reduce(
    (acc, domain) => {
      const check = domain.checks?.[0];
      const days = calculateDays(check?.validTo || null);
      const isValid = check?.isValid !== false;

      if (!check || !isValid || (days !== null && days < 7)) {
        acc.critical++;
      } else if (days !== null && days < 30) {
        acc.warning++;
      } else {
        acc.healthy++;
      }

      return acc;
    },
    { critical: 0, warning: 0, healthy: 0 }
  );

  return (
    <div
      onClick={onRowClick}
      className={`p-5 flex flex-col gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors group
                 ${gridLayout}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider md:hidden block mb-1">
            Serveur
          </span>
          <span className="inline-block text-sm font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg truncate max-w-full">
            {server.name || 'Non nommé'}
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider md:hidden block mb-1">
          Adresse IP
        </span>
        <span className="inline-block text-xs sm:text-sm font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
          {server.ipAddress || "Pas d'IP"}
        </span>
      </div>

      <div>
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider md:hidden block mb-1">
          Domaines rattachés
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full">
            {stats.critical} critique{stats.critical > 1 ? "s" : ""}
          </span>
          <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2.5 py-0.5 rounded-full">
            {stats.warning} en danger
          </span>
          <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 px-2.5 py-0.5 rounded-full">
            {stats.healthy} sain{stats.healthy > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-end gap-1 pt-3 border-t border-slate-100 md:pt-0 md:border-0 w-full"
      >
        <button
          onClick={() => openEditModal(server.id)}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-lg"
          title="Modifier le serveur"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => handleDeleteServer(server.id)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-lg"
          title="Supprimer le serveur"
        >
          <Trash2 size={18} />
        </button>
      </div>

    </div>
  );
}

export default RowLineServers;