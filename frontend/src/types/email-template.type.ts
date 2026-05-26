export interface EmailTemplateSettings {
  title: string;
  introText: string;
  primaryColor: string;
  introColor: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  borderColor: string;
}

export const defaultEmailTemplateSettings: EmailTemplateSettings = {
  title: 'Récapitulatif des alertes SSL',
  introText: 'Les domaines suivants nécessitent une action :',
  primaryColor: '#0f172a',
  introColor: '#000000',
  headerBackgroundColor: '#eeeeee',
  headerTextColor: '#000000',
  borderColor: '#e0e0e0',
};