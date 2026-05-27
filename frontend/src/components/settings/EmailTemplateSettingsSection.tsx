import { Loader2, RotateCcw, Save } from 'lucide-react';
import type { EmailTemplateSettings } from '@/types/email-template.type';
import InfoTooltip from '@/components/ui/InfoTooltip';

interface EmailTemplateSettingsSectionProps {
  template: EmailTemplateSettings;
  previewHtml: string;
  isLoadingPreview: boolean;
  error: string | null;
  success: string | null;
  isSavingTemplate: boolean;
  onTemplateChange: (key: keyof EmailTemplateSettings, value: string) => void;
  onResetTemplate: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

function EmailTemplateSettingsSection({
  template,
  previewHtml,
  isLoadingPreview,
  error,
  success,
  isSavingTemplate,
  onTemplateChange,
  onResetTemplate,
  onSubmit,
}: EmailTemplateSettingsSectionProps) {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-[1fr_1.1fr] gap-6 items-start">
      <form onSubmit={onSubmit} className="bg-white rounded-4xl border border-slate-200 shadow-sm p-8 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-800">Modèle du mail</h2>
              <InfoTooltip text={["Modifiez seulement le texte et les couleurs principales."]} />
            </div>

          <button
            type="button"
            onClick={onResetTemplate}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Revenir aux couleurs et textes par défaut"
          >
            <RotateCcw size={16} />
            Valeurs par défaut
          </button>
        </div>

        <label className="space-y-2 block">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titre</span>
          <input
            type="text"
            value={template.title}
            onChange={(e) => onTemplateChange('title', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-secondary-200 focus:border-secondary-300"
          />
        </label>

        <label className="space-y-2 block">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Texte d introduction</span>
          <textarea
            rows={4}
            value={template.introText}
            onChange={(e) => onTemplateChange('introText', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-secondary-200 focus:border-secondary-300 resize-none"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="space-y-2 block">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Couleur titre</span>
            <input
              type="color"
              value={template.primaryColor}
              onChange={(e) => onTemplateChange('primaryColor', e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-100 bg-white p-1"
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Couleur intro</span>
            <input
              type="color"
              value={template.introColor}
              onChange={(e) => onTemplateChange('introColor', e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-100 bg-white p-1"
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fond header</span>
            <input
              type="color"
              value={template.headerBackgroundColor}
              onChange={(e) => onTemplateChange('headerBackgroundColor', e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-100 bg-white p-1"
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Texte header</span>
            <input
              type="color"
              value={template.headerTextColor}
              onChange={(e) => onTemplateChange('headerTextColor', e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-100 bg-white p-1"
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bordure</span>
            <input
              type="color"
              value={template.borderColor}
              onChange={(e) => onTemplateChange('borderColor', e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-100 bg-white p-1"
            />
          </label>

        </div>

        <div className="rounded-3xl bg-slate-50 border border-slate-100 p-5 text-sm text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">Champs modifiables</p>
          <p>Le contenu de la table reste généré automatiquement par le backend pour éviter les erreurs de structure.</p>
          <p>Vous pouvez changer le texte et les couleurs sans toucher au HTML brut.</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-green-50 text-green-700 text-sm font-medium border border-green-100">
            {success}
          </div>
        )}

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSavingTemplate}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-secondary text-white font-bold hover:bg-secondary-hover transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSavingTemplate ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Enregistrer le modèle
          </button>
        </div>
      </form>

      <div className="bg-white rounded-4xl border border-slate-200 shadow-sm p-5 space-y-4 min-h-175">
        <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-800">Preview du mail</h2>
              <InfoTooltip text={["Cette prévisualisation utilise les mêmes placeholders que l'email réel."]} />
            </div>
          {isLoadingPreview && <Loader2 className="animate-spin text-slate-400" size={20} />}
        </div>

        <div className="rounded-[28px] border border-slate-100 overflow-hidden bg-slate-50 min-h-155">
          <iframe
            title="Prévisualisation email SSL"
            srcDoc={previewHtml || '<div style="font-family:sans-serif;padding:24px;">Chargement de la preview...</div>'}
            className="w-full min-h-155 bg-white"
          />
        </div>
      </div>
    </section>
  );
}

export default EmailTemplateSettingsSection;