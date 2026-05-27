import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Save, ShieldAlert } from 'lucide-react';
import type { AlertThresholds } from '@/types/alert-thresholds.type';
import { defaultEmailTemplateSettings, type EmailTemplateSettings } from '@/types/email-template.type';
import { fetchThresholds, updateThresholds } from '@/api/thresholds.api';
import { fetchEmailTemplatePreviewHtml, fetchEmailTemplateSettings, updateEmailTemplateSettings } from '@/api/email-template.api';
import EmailTemplateSettingsSection from '@/components/settings/EmailTemplateSettingsSection';
import InfoTooltip from '@/components/ui/InfoTooltip';

const DEFAULT_THRESHOLDS: AlertThresholds = {
	critical: 7,
	warning: 14,
	info: 30,
};

export default function AlertSetting() {
	const [thresholds, setThresholds] = useState<AlertThresholds>(DEFAULT_THRESHOLDS);
	const [template, setTemplate] = useState<EmailTemplateSettings>(defaultEmailTemplateSettings);
	const [previewHtml, setPreviewHtml] = useState('');

	const [isLoading, setIsLoading] = useState(true);
	const [isSavingThresholds, setIsSavingThresholds] = useState(false);
	const [isSavingTemplate, setIsSavingTemplate] = useState(false);
	const [isLoadingPreview, setIsLoadingPreview] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	useEffect(() => {
		const loadData = async () => {
			try {
				const [thresholdData, templateData] = await Promise.all([
					fetchThresholds(),
					fetchEmailTemplateSettings(),
				]);

				if (thresholdData) setThresholds(thresholdData);
				if (templateData) setTemplate(templateData);
			} catch (err) {
				console.error('Erreur chargement paramètres', err);
				setError('Impossible de charger les paramètres, les valeurs par défaut sont affichées.');
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, []);

	useEffect(() => {
		if (isLoading) return;

		let cancelled = false;
		const timeout = window.setTimeout(async () => {
			try {
				setIsLoadingPreview(true);
				const html = await fetchEmailTemplatePreviewHtml(template);
				if (!cancelled) setPreviewHtml(html);
			} catch (err) {
				console.error('Erreur preview email', err);
			} finally {
				if (!cancelled) setIsLoadingPreview(false);
			}
		}, 250);

		return () => {
			cancelled = true;
			window.clearTimeout(timeout);
		};
	}, [template, isLoading]);

	const updateThreshold = (key: keyof AlertThresholds, value: string) => {
		setError(null);
		setSuccess(null);
		setThresholds(prev => ({ ...prev, [key]: Number(value) }));
	};

	const updateTemplateField = (key: keyof EmailTemplateSettings, value: string) => {
		setError(null);
		setSuccess(null);
		setTemplate(prev => ({ ...prev, [key]: value }));
	};

	const resetTemplate = () => {
		setError(null);
		setSuccess(null);
		setTemplate({ ...defaultEmailTemplateSettings });
	};

	const validateThresholds = () => {
		const values = [thresholds.critical, thresholds.warning, thresholds.info];

		if (values.some(value => !Number.isInteger(value))) {
			return 'Les seuils doivent être des nombres entiers.';
		}

		if (values.some(value => value <= 0)) {
			return 'Les seuils doivent être strictement positifs.';
		}

		if (!(thresholds.critical < thresholds.warning && thresholds.warning < thresholds.info)) {
			return 'L ordre doit être respecté : critique < danger < sain.';
		}

		return null;
	};

	const validateTemplate = () => {
		if (!template.title.trim()) return 'Le titre du mail est requis.';
		if (!template.introText.trim()) return 'Le texte d introduction est requis.';
		return null;
	};

	const handleThresholdSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const validationError = validateThresholds();
		if (validationError) {
			setError(validationError);
			return;
		}

		setIsSavingThresholds(true);
		setError(null);
		setSuccess(null);

		try {
			const data = await updateThresholds(thresholds);
			if (data) setThresholds(data);
			setSuccess('Seuils mis à jour avec succès.');
		} catch {
			setError('Erreur lors de la mise à jour des seuils.');
		} finally {
			setIsSavingThresholds(false);
		}
	};

	const handleTemplateSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const validationError = validateTemplate();
		if (validationError) {
			setError(validationError);
			return;
		}

		setIsSavingTemplate(true);
		setError(null);
		setSuccess(null);

		try {
			const data = await updateEmailTemplateSettings(template);
			setTemplate(data);
			setSuccess('Modèle du mail mis à jour avec succès.');
		} catch {
			setError('Erreur lors de la mise à jour du modèle du mail.');
		} finally {
			setIsSavingTemplate(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[60vh]">
				<Loader2 className="animate-spin text-secondary" size={28} />
			</div>
		);
	}

	return (
		<div className="p-8 max-w-6xl mx-auto space-y-6">
			<div className="flex items-start gap-4">
				<div>
					<h1 className="text-3xl font-black text-slate-800 tracking-tight">Paramètres des alertes</h1>
					<p className="text-slate-500 font-medium text-sm mt-1">
						Ajustez ici les seuils et le modèle du mail envoyé aux destinataires.
					</p>
				</div>
			</div>

			<section className="bg-white rounded-4xl border border-slate-200 shadow-sm p-8 space-y-6">
				<div className="flex items-center gap-3">
					<div className="p-3 bg-red-50 text-red-600 rounded-2xl">
						<ShieldAlert size={22} />
					</div>
					<div className="flex items-center gap-2">
						<h2 className="text-2xl font-bold text-slate-800">Seuils d alerte</h2>
						<InfoTooltip text={[
              "Ces valeurs pilotent la classification des certificats SSL.",
              "L'ordre attendu est: critique < danger < sain.",
              "L'unité de mesure est en jours."
              ]} />
					</div>
				</div>

				<form onSubmit={handleThresholdSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<label className="space-y-2 block">
						<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Critique</span>
						<div className="relative">
							<AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={18} />
							<input
								type="number"
								min={1}
								step={1}
								value={thresholds.critical}
								onChange={(e) => updateThreshold('critical', e.target.value)}
								className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
							/>
						</div>
					</label>

					<label className="space-y-2 block">
						<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">En danger</span>
						<div className="relative">
							<AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
							<input
								type="number"
								min={1}
								step={1}
								value={thresholds.warning}
								onChange={(e) => updateThreshold('warning', e.target.value)}
								className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
							/>
						</div>
					</label>

					<label className="space-y-2 block">
						<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sain</span>
						<div className="relative">
							<AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={18} />
							<input
								type="number"
								min={1}
								step={1}
								value={thresholds.info}
								onChange={(e) => updateThreshold('info', e.target.value)}
								className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
							/>
						</div>
					</label>

					<div className="md:col-span-3 flex items-center justify-end gap-4 flex-wrap pt-2">
						<button
							type="submit"
							disabled={isSavingThresholds}
							className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-secondary text-white font-bold hover:bg-secondary-hover transition-all disabled:opacity-50 cursor-pointer"
						>
							{isSavingThresholds ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
							Enregistrer les seuils
						</button>
					</div>
				</form>
			</section>

				<EmailTemplateSettingsSection
					template={template}
					previewHtml={previewHtml}
					isLoadingPreview={isLoadingPreview}
					error={error}
					success={success}
					isSavingTemplate={isSavingTemplate}
					onTemplateChange={updateTemplateField}
					onResetTemplate={resetTemplate}
					onSubmit={handleTemplateSubmit}
				/>
		</div>
	);
}
