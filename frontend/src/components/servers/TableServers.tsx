import { useState } from "react";
import type { IServer } from "@/types/server.type";
import RowLineServers from "./RowLineServers";
import TableDomains from "../domains/TableDomains";
import type { Domain } from "@/types/domain.type";

interface TableServersProps {
  servers: IServer[];
  openEditModal: (id: number) => void;
  handleDeleteServer: (serverId: number) => void;
  domainActions: {
    refreshingId: number | null;
    openEditModal: (domain: Domain) => void;
    handleManualCheck: (domainId: number) => void;
    handleDeleteDomain: (domainId: number) => void;
  };
}

const SERVER_GRID_LAYOUT = "md:grid md:grid-cols-[30%_20%_35%_10%] md:gap-4 md:items-center";

function TableServers({ servers, openEditModal, handleDeleteServer, domainActions }: TableServersProps) {
  const [expandedServerId, setExpandedServerId] = useState<number | null>(null);

  const toggleServer = (serverId: number) => {
    setExpandedServerId(prev => (prev === serverId ? null : serverId));
  };

  return (
    <div className="bg-transparent md:bg-white md:rounded-2xl md:border md:border-slate-200 md:shadow-sm overflow-hidden">

      <div className={`hidden ${SERVER_GRID_LAYOUT} bg-slate-50 border-b border-slate-200 p-4 text-xs font-bold uppercase text-slate-500`}>
        <div>Nom</div>
        <div>IP</div>
        <div>Statut des domaines</div>
        <div className="text-right">Actions</div>
      </div>

      <div className="space-y-4 md:space-y-0 md:divide-y md:divide-slate-100">
        {servers.map(server => {
          const isExpanded = expandedServerId === server.id;
          return (
            <div
              key={server.id}
              className={`bg-white rounded-2xl border border-slate-200 shadow-sm transition-all
                         md:rounded-none md:border-0 md:shadow-none ${isExpanded ? 'bg-slate-50/30' : ''}`}
            >
              <RowLineServers
                server={server}
                openEditModal={openEditModal}
                handleDeleteServer={handleDeleteServer}
                onRowClick={() => toggleServer(server.id)}
                isExpanded={isExpanded}
                gridLayout={SERVER_GRID_LAYOUT}
              />

              {isExpanded && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 animate-fadeIn">
                  <div className="bg-white rounded-xl border border-slate-100 p-2 md:p-4 shadow-inner">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 md:hidden">
                      Domaines associés :
                    </h4>
                    {server.domains && server.domains.length > 0 ? (
                      <TableDomains
                        domains={server.domains}
                        refreshingId={domainActions.refreshingId}
                        openEditModal={domainActions.openEditModal}
                        handleManualCheck={domainActions.handleManualCheck}
                        handleDeleteDomain={domainActions.handleDeleteDomain}
                        visibleColumns={["domain", "expiration", "actions"]}
                      />
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-6 font-medium">
                        Aucun domaine associé à ce serveur.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TableServers;