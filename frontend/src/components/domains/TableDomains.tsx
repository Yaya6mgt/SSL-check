import type { Domain } from "@/types/domain.type";
import RowLineDomains from "./RowLineDomains";

interface TableDomainsProps {
  domains: Domain[];
  refreshingId: number | null;
  openEditModal: (domain: Domain) => void;
  handleManualCheck: (domainId: number) => void;
  handleDeleteDomain: (domainId: number) => void;
}

function TableDomains({ domains, refreshingId, openEditModal, handleManualCheck, handleDeleteDomain }: TableDomainsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="p-4 text-xs font-bold uppercase text-slate-500">Domaine</th>
            <th className="p-4 text-xs font-bold uppercase text-slate-500">Serveur</th>
            <th className="p-4 text-xs font-bold uppercase text-slate-500">Expiration</th>
            <th className="p-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {domains.map(domain => {
            return (
              <RowLineDomains
                key={domain.id}
                domain={domain}
                refreshingId={refreshingId}
                openEditModal={openEditModal}
                handleManualCheck={handleManualCheck}
                handleDeleteDomain={handleDeleteDomain}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TableDomains;