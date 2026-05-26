import { ApiError, apiFetch } from "@/utils/api";
import type { Domain } from "@/types/domain.type";
import type { ISslCheck } from "@/types/sslcheck.type";
import { getToken } from "@/utils/localStorage";

const token = getToken;

export const deleteDomain = async (domainId: number) => {
  if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce domaine ?")) return;

  try {
    await apiFetch(`domains/${domainId}`, {
      method: 'DELETE',
      token,
    });
  } catch {
    alert("Erreur lors de la suppression du domaine");
  }
};

export const fetchDomains = async (setDomains: React.Dispatch<React.SetStateAction<Domain[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
 try {
    const data = await apiFetch<Domain[]>(`domains`, {token});
    setDomains(data);
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(`Erreur API (${err.status}):`, err.message);
    } else {
      console.error("Erreur inconnue:", err);
    }
  } finally {
    setLoading(false);
  }
};

export const postDomain = async (hostname: string, serverId: string) => {
  try {
      await apiFetch('domains', {
        method: 'POST',
        body: {
            hostname: hostname,
            serverId: Number(serverId)
        },
        token,
      });
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(`Erreur API (${err.status}):`, err.message);
    } else {
      console.error("Erreur inconnue:", err);
    }
  }
};

export const updateDomain = async (domainId: number, hostname: string, serverId: string) => {
  try {
      await apiFetch(`domains/${domainId}`, {
        method: 'PUT',
        body: {
            hostname,
            serverId: Number(serverId)
        },
        token,
      });
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(`Erreur API (${err.status}):`, err.message);
    } else {
      console.error("Erreur inconnue:", err);
    }
  }
};

export const deleteDomainById = async (domainId: number) => {

  try {
    await apiFetch(`domains/${domainId}`, {
      method: 'DELETE',
      token,
    });
  } catch {
    alert("Erreur lors de la suppression du domaine");
  }
};

export const checkDomain = async (domainId: number) => {
  try {
    const response : { message: string, check: ISslCheck } = await apiFetch(`domains/${domainId}/check`, {
      method: 'POST',
      token,
    });
    return response;
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(`Erreur API (${err.status}):`, err.message);
    } else {
      console.error("Erreur inconnue:", err);
    }
  }
};

export const checkAllDomains = async () => {
  try {
    await apiFetch(`domains/check-all`, {
      method: 'POST',
      token,
    });
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(`Erreur API (${err.status}):`, err.message);
    } else {
      console.error("Erreur inconnue:", err);
    }
  }
}