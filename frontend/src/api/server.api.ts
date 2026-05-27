import type { IServer } from "@/types/server.type";
import { ApiError, apiFetch } from "@/utils/api";
import { getToken } from "@/utils/localStorage";

const token = getToken;

export const fetchServers = async (setServers: React.Dispatch<React.SetStateAction<IServer[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  try {
    const data = await apiFetch<IServer[]>(`servers`, {token});
    setServers(data);
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

export const fetchServer = async (id: number, setServer: React.Dispatch<React.SetStateAction<IServer | null>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  try {
    const data = await apiFetch<IServer>(`servers/${id}`, {token});
    setServer(data);
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

export const postServer = async (name: string, ipAddress: string) => {
  try {
      const data = await apiFetch<IServer>('servers', {
        method: 'POST',
        body: { name, ipAddress },
        token,
      });
      return data;
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(`Erreur API (${err.status}):`, err.message);
    } else {
      console.error("Erreur inconnue:", err);
    }
  }
};

export const deleteServer = async (id: number) => {
  try {
    await apiFetch(`servers/${id}`, {
      method: 'DELETE',
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

export const updateServer = async (id: number, name: string, ipAddress: string) => {
  try {
    console.log("Données envoyées à l'API:", { name, ipAddress });
    return await apiFetch<IServer>(`servers/${id}`, {
      method: 'PUT',
      token,
      body: { name, ipAddress }
    });
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(`Erreur API (${err.status}):`, err.message);
    } else {
      console.error("Erreur inconnue:", err);
    }
  }
};