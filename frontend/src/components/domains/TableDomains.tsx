import type { Domain } from "@/types/domain.type";
import RowLineDomains from "./RowLineDomains";

export type DomainTableColumn = "domain" | "server" | "expiration" | "actions";

const DEFAULT_COLUMNS: DomainTableColumn[] = ["domain", "server", "expiration", "actions"];

interface TableDomainsProps {
  domains: Domain[];
  refreshingId: number | null;
  openEditModal: (domain: Domain) => void;
  handleManualCheck: (domainId: number) => void;
  handleDeleteDomain: (domainId: number) => void;
  visibleColumns?: DomainTableColumn[];
}

function TableDomains({
  domains,
  refreshingId,
  openEditModal,
  handleManualCheck,
  handleDeleteDomain,
  visibleColumns = DEFAULT_COLUMNS,
}: TableDomainsProps) {


  return (
    <div className="bg-transparent md:bg-white md:rounded-2xl md:border md:border-slate-200 md:shadow-sm overflow-hidden">

      {/* HEADER : Uniquement visible sur Desktop (md+) */}
      <div
        className={`hidden md:grid-cols-[30%_25%_20%_20%] gap-4 bg-slate-50 border-b border-slate-200 p-4 text-xs font-bold uppercase text-slate-500`}
      >
        {visibleColumns.includes("domain") && <div>Domaine</div>}
        {visibleColumns.includes("server") && <div>Serveur</div>}
        {visibleColumns.includes("expiration") && <div>Expiration</div>}
        {visibleColumns.includes("actions") && <div className="text-right">Actions</div>}
      </div>

      <div className="space-y-4 md:space-y-0 md:divide-y md:divide-slate-100">
        {domains.map((domain) => (
          <RowLineDomains
            key={domain.id}
            domain={domain}
            refreshingId={refreshingId}
            openEditModal={openEditModal}
            handleManualCheck={handleManualCheck}
            handleDeleteDomain={handleDeleteDomain}
            visibleColumns={visibleColumns}
          />
        ))}
      </div>
    </div>
  );
}

export default TableDomains;