import { Fragment, useState } from "react";
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

function TableServers({ servers, openEditModal, handleDeleteServer, domainActions }: TableServersProps) {
  const [expandedServerId, setExpandedServerId] = useState<number | null>(null);

  const toggleServer = (serverId: number) => {
    setExpandedServerId(prev => (prev === serverId ? null : serverId));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="p-4 text-xs font-bold uppercase text-slate-500">Nom</th>
            <th className="p-4 text-xs font-bold uppercase text-slate-500">Ip</th>
            <th className="p-4 text-xs font-bold uppercase text-slate-500">Nombre de domaines</th>
            <th className="p-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {servers.map(server => {
            const isExpanded = expandedServerId === server.id;
            return (
              <Fragment key={server.id}>
                <RowLineServers
                  server={server}
                  openEditModal={openEditModal}
                  handleDeleteServer={handleDeleteServer}
                  onRowClick={() => toggleServer(server.id)}
                  isExpanded={isExpanded}
                />

                {isExpanded && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={4} className="p-4 border-t border-slate-100">
                      <div className="bg-white rounded-xl shadow-inner p-2">
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
                          <p className="text-sm text-slate-400 text-center py-4">
                            Aucun domaine associé à ce serveur.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TableServers;