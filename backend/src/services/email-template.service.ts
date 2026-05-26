import fs from 'fs/promises';
import path from 'path';
import { AlertEmailTemplateSetting } from '@/models/AlertEmailTemplateSetting';

export interface EmailTemplateSettings {
  title: string;
  introText: string;
  primaryColor: string;
  introColor: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  borderColor: string;
}

export type EmailTemplateInput = Partial<EmailTemplateSettings>;

export const DEFAULT_EMAIL_TEMPLATE_SETTINGS: EmailTemplateSettings = {
  title: 'Récapitulatif des alertes SSL',
  introText: 'Les domaines suivants nécessitent une action :',
  primaryColor: '#0f172a',
  introColor: '#000000',
  headerBackgroundColor: '#eeeeee',
  headerTextColor: '#000000',
  borderColor: '#e0e0e0',
};

const COLOR_PATTERN = /^#([0-9a-fA-F]{6})$/;

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const normalizeColor = (value: string | undefined, fallback: string) => {
  if (!value) return fallback;
  return COLOR_PATTERN.test(value) ? value : fallback;
};

const normalizeText = (value: string | undefined, fallback: string) => (value?.trim() ? value.trim() : fallback);

export class EmailTemplateService {
  private static templatePath = path.join(__dirname, '..', 'templates', 'alert-email.html');

  static async getCurrentSettings(): Promise<EmailTemplateSettings> {
    const setting = await this.getOrCreateSetting();

    return this.toSettings(setting);
  }

  static async updateSettings(input: EmailTemplateInput): Promise<EmailTemplateSettings> {
    const setting = await this.getOrCreateSetting();
    const normalized = this.normalizeInput(input);

    await setting.update(normalized);

    return this.toSettings(setting);
  }

  static async renderEmailHtml(tableContent: string, settings?: EmailTemplateSettings) {
    const template = await fs.readFile(this.templatePath, 'utf-8');
    const currentSettings = settings || await this.getCurrentSettings();

    return template
      .replace(/{{title}}/g, escapeHtml(currentSettings.title))
      .replace(/{{introText}}/g, escapeHtml(currentSettings.introText))
      .replace(/{{primaryColor}}/g, currentSettings.primaryColor)
      .replace(/{{headerBackgroundColor}}/g, currentSettings.headerBackgroundColor)
      .replace(/{{headerTextColor}}/g, currentSettings.headerTextColor)
      .replace(/{{borderColor}}/g, currentSettings.borderColor)
      .replace(/{{introColor}}/g, currentSettings.introColor)
      .replace(/{{tableContent}}/g, tableContent);
  }

  static async renderPreviewHtml(input?: EmailTemplateInput) {
    const settings = input ? this.mergeSettings(input) : await this.getCurrentSettings();

    const tableContent = this.buildPreviewRows(settings.borderColor);
    return this.renderEmailHtml(tableContent, settings);
  }

  static async getOrCreateSetting(): Promise<AlertEmailTemplateSetting> {
    let setting = await AlertEmailTemplateSetting.findOne();

    if (!setting) {
      setting = await AlertEmailTemplateSetting.create(DEFAULT_EMAIL_TEMPLATE_SETTINGS);
    }

    return setting;
  }

  static toSettings(setting: AlertEmailTemplateSetting): EmailTemplateSettings {
    return {
      title: setting.title,
      introText: setting.introText,
      primaryColor: setting.primaryColor,
      introColor: setting.introColor,
      headerBackgroundColor: setting.headerBackgroundColor,
      headerTextColor: setting.headerTextColor,
      borderColor: setting.borderColor,
    };
  }

  static mergeSettings(input: EmailTemplateInput): EmailTemplateSettings {
    return {
      title: normalizeText(input.title, DEFAULT_EMAIL_TEMPLATE_SETTINGS.title),
      introText: normalizeText(input.introText, DEFAULT_EMAIL_TEMPLATE_SETTINGS.introText),
      primaryColor: normalizeColor(input.primaryColor, DEFAULT_EMAIL_TEMPLATE_SETTINGS.primaryColor),
      introColor: normalizeColor(input.introColor, DEFAULT_EMAIL_TEMPLATE_SETTINGS.introColor),
      headerBackgroundColor: normalizeColor(input.headerBackgroundColor, DEFAULT_EMAIL_TEMPLATE_SETTINGS.headerBackgroundColor),
      headerTextColor: normalizeColor(input.headerTextColor, DEFAULT_EMAIL_TEMPLATE_SETTINGS.headerTextColor),
      borderColor: normalizeColor(input.borderColor, DEFAULT_EMAIL_TEMPLATE_SETTINGS.borderColor),
    };
  }

  static normalizeInput(input: EmailTemplateInput): EmailTemplateSettings {
    return this.mergeSettings(input);
  }

  static buildPreviewRows(borderColor: string) {
    return [
      {
        hostname: 'api.demo.local',
        serverName: 'srv-prod-01',
        days: '4j',
        level: 'CRITIQUE',
        color: '#D32F2F',
      },
      {
        hostname: 'app.demo.local',
        serverName: 'srv-prod-02',
        days: '12j',
        level: 'ATTENTION',
        color: '#F57C00',
      },
      {
        hostname: 'www.demo.local',
        serverName: 'srv-prod-03',
        days: '48j',
        level: 'INFO',
        color: '#0288D1',
      },
    ].map(row => `
      <tr>
        <td style="padding:10px; border:1px solid ${borderColor};">${escapeHtml(row.hostname)}</td>
        <td style="padding:10px; border:1px solid ${borderColor};">${escapeHtml(row.serverName)}</td>
        <td style="padding:10px; border:1px solid ${borderColor};">${escapeHtml(row.days)}</td>
        <td style="padding:10px; border:1px solid ${borderColor}; color: ${row.color}; font-weight: bold;">
          ${escapeHtml(row.level)}
        </td>
      </tr>`).join('');
  }
}