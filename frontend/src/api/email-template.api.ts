import { apiFetch } from '@/utils/api';
import { getToken } from '@/utils/localStorage';
import type { EmailTemplateSettings } from '@/types/email-template.type';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchEmailTemplateSettings = async () => {
  return apiFetch<EmailTemplateSettings>('email-template', { token: getToken });
};

export const updateEmailTemplateSettings = async (settings: EmailTemplateSettings) => {
  return apiFetch<EmailTemplateSettings>('email-template', {
    method: 'PUT',
    body: settings,
    token: getToken,
  });
};

export const fetchEmailTemplatePreviewHtml = async (settings: EmailTemplateSettings) => {
  const response = await fetch(`${API_URL}/email-template/preview`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken || ''}`,
      'Content-Type': 'application/json',
      Accept: 'text/html',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const errorMessage = await response.text().catch(() => 'Erreur lors du chargement de la preview.');
    throw new Error(errorMessage);
  }

  return response.text();
};