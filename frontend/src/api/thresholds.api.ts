import type { AlertThresholds } from "@/types/alert-thresholds.type";
import { ApiError, apiFetch } from "@/utils/api";
import { getToken } from "@/utils/localStorage";

const token = getToken;

export const fetchThresholds = async () => {
  try {
    const data = await apiFetch<AlertThresholds>(`alert-thresholds`, {token});
    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(`Erreur API (${err.status}):`, err.message);
    } else {
      console.error("Erreur inconnue:", err);
    }
  }
};

export const updateThresholds = async (thresholds: AlertThresholds) => {
  try {
    const data = await apiFetch<AlertThresholds>(`alert-thresholds`, {
      method: 'PUT',
      body: thresholds,
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