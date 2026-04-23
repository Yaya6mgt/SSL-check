import type { IServer } from "@/types/server.type";
import { ApiError, apiFetch } from "@/utils/api";

export const fetchServers = async (setServers: React.Dispatch<React.SetStateAction<IServer[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  try {
    const data = await apiFetch<IServer[]>(`servers`);
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
    const data = await apiFetch<IServer>(`servers/${id}`);
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