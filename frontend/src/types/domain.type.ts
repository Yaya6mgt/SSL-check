import type { IServer } from "./server.type";
import type { ISslCheck } from "./sslcheck.type";

export interface Domain {
    id: number;
    hostname: string;
    serverId: number;
    createdAt: string;
    updatedAt: string;
    server?: IServer,
    checks: ISslCheck[];
}

export interface NewDomainState {
  hostname: string;
  serverId: string;
  newServerName?: string;
  newServerIp?: string;
}

export const initialDomainState: NewDomainState = {
  hostname: '',
  serverId: '',
  newServerName: '',
  newServerIp: ''
};