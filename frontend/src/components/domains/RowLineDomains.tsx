import { calculateDays, getStatusConfig } from "@/utils/status";
import type { Domain } from "@/types/domain.type";
import { Pencil, Trash2 } from "lucide-react";
import { RefreshButton } from "@/components/common/utils/RefreshButton";
import DisplayErrorIcon from "./DisplayErrorIcon";

interface RowLineDomainsProps {
  domain: Domain;
  refreshingId: number | null;
  openEditModal: (domain: Domain) => void;
  handleManualCheck: (domainId: number) => void;
  handleDeleteDomain: (domainId: number) => void;
}

function RowLineDomains({ domain, refreshingId, openEditModal, handleManualCheck, handleDeleteDomain }: RowLineDomainsProps) {
  const days = calculateDays(domain.checks?.[0]?.validTo);
  const config = getStatusConfig(days, domain.checks?.[0]?.isValid);

  return (
    <tr key={domain.id} className="hover:bg-slate-50/50 transition-colors group">
      <td className="p-4">
        <DisplayErrorIcon domain={domain} />
      </td>
      <td className="p-4">
        <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
          {domain.server?.name || 'Non lié'}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${config.bg.replace('100', '500')}`} />
          <span className={`text-sm font-bold ${config.color}`}>
            {days !== null ? `${days} jours` : 'N/A'}
          </span>
        </div>
      </td>
      <td className="p-4 text-right space-x-2">
        <div className="inline-flex items-center gap-1 px-2 py-1">
          <button
            onClick={() => openEditModal(domain)}
            className="p-2 text-slate-400 hover:text-primary transition-colors mr-3"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => handleDeleteDomain(domain.id)}
            className="p-2 text-slate-400 hover:text-red-600 transition-colors mr-3"
          >
            <Trash2 size={18} />
          </button>
          <RefreshButton
            onClick={() => handleManualCheck(domain.id)}
            isLoading={refreshingId === domain.id}
            group={false}
            className="px-2 py-2 border-transparent hover:border-secondary-100"
          />
        </div>
      </td>
    </tr>
  );
}

export default RowLineDomains;