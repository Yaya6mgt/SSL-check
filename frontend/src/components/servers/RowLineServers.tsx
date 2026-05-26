import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import type { IServer } from "@/types/server.type";
import { calculateDays } from "@/utils/status";

interface RowLineServersProps {
  server: IServer;
  openEditModal: (id: number) => void;
  handleDeleteServer: (serverId: number) => void;
  onRowClick: () => void;
  isExpanded: boolean;
}

function RowLineServers({ server, openEditModal, handleDeleteServer, onRowClick, isExpanded }: RowLineServersProps) {
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
    <tr className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={onRowClick}>
      <td className="p-4 font-medium text-slate-700">
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
          <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
            {server.name || 'Non nommé'}
          </span>
        </div>
      </td>

      <td className="p-4">
        <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
          {server.ipAddress || "Pas d'IP"}
        </span>
      </td>

      <td className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">
            {stats.critical} critique{stats.critical > 1 ? "s" : ""}
          </span>
          <span className="text-[10px] font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
            {stats.warning} en danger
          </span>
          <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
            {stats.healthy} sain{stats.healthy > 1 ? "s" : ""}
          </span>
        </div>
      </td>

      <td className="p-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
        <div className="inline-flex items-center gap-1 px-2 py-1">
          <button
            onClick={() => openEditModal(server.id)}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors mr-3"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => handleDeleteServer(server.id)}
            className="p-2 text-slate-400 hover:text-red-600 transition-colors mr-3"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default RowLineServers;