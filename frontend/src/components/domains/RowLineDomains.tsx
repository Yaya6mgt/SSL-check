import { calculateDays, getStatusConfig } from "@/utils/status";
import type { Domain } from "@/types/domain.type";
import { Pencil, Trash2 } from "lucide-react";
import { RefreshButton } from "@/components/common/utils/RefreshButton";
import DisplayErrorIcon from "./DisplayErrorIcon";
import type { DomainTableColumn } from "./TableDomains";

interface RowLineDomainsProps {
  domain: Domain;
  refreshingId: number | null;
  openEditModal: (domain: Domain) => void;
  handleManualCheck: (domainId: number) => void;
  handleDeleteDomain: (domainId: number) => void;
  visibleColumns: DomainTableColumn[];
}

function RowLineDomains({
  domain,
  refreshingId,
  openEditModal,
  handleManualCheck,
  handleDeleteDomain,
  visibleColumns,
}: RowLineDomainsProps) {
  const days = calculateDays(domain.checks?.[0]?.validTo);
  const config = getStatusConfig(days, domain.checks?.[0]?.isValid);

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 transition-all hover:border-slate-300
                 md:rounded-none md:border-0 md:shadow-none md:p-4 md:grid md:items-center group hover:bg-slate-50/50"
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-4 transition-all hover:border-slate-300
                   md:rounded-none md:border-0 md:shadow-none md:p-4 md:grid md:grid-cols-[40%_25%_15%_15%] md:items-center group hover:bg-slate-50/50"
      >

        {visibleColumns.includes("domain") && (
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider md:hidden block mb-1">
              Domaine
            </span>
            <DisplayErrorIcon domain={domain} />
          </div>
        )}

        {visibleColumns.includes("server") && (
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider md:hidden block mb-1">
              Serveur
            </span>
            <span className="inline-block text-sm font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {domain.server?.name || "Non lié"}
            </span>
          </div>
        )}

        {visibleColumns.includes("expiration") && (
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider md:hidden block mb-1">
              Expiration
            </span>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${config.bg.replace("100", "500")}`} />
              <span className={`text-sm font-bold ${config.color}`}>
                {days !== null ? `${days} jours` : "N/A"}
              </span>
            </div>
          </div>
        )}

        {visibleColumns.includes("actions") && (
          <div className="flex items-center justify-end gap-1 pt-3 border-t border-slate-100 md:pt-0 md:border-0 w-full">
            <button
              onClick={() => openEditModal(domain)}
              className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
              title="Modifier"
            >
              <Pencil size={18} />
            </button>

            <button
              onClick={() => handleDeleteDomain(domain.id)}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
              title="Supprimer"
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
        )}

      </div>
    </div>
  );
}

export default RowLineDomains;