import { BadgeCheck, ShieldAlert, ShieldX } from "lucide-react";

export type FilterStatus = 'ALL' | 'VALID' | 'ERROR' | 'EXPIRING';

interface DomainsFiltersProps {
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
  filterDays: [number, number];
  setFilterDays: (days: [number, number]) => void;
}

export function DomainsFilters({
  filterStatus,
  setFilterStatus,
  filterDays,
  setFilterDays
}: DomainsFiltersProps) {
  const remainingDays = filterDays[1] - filterDays[0];
  const statusOptions: Array<{ id: FilterStatus; label: string; icon?: React.ElementType }> = [
    { id: 'ALL', label: 'Tous' },
    { id: 'VALID', label: 'Valides', icon: BadgeCheck },
    { id: 'ERROR', label: 'Erreurs', icon: ShieldX },
    { id: 'EXPIRING', label: 'Expirant < 30j', icon: ShieldAlert }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-end gap-8">
      <div className="flex-1 min-w-75">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Statut du certificat</label>
        <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilterStatus(opt.id)}
              className={`inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                filterStatus === opt.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {'icon' in opt && opt.icon ? (
                <opt.icon size={20} className="sm:hidden" />
              ) : null}
              <span className="hidden sm:inline">{opt.label}</span>
              {'icon' in opt && opt.icon ? null : <span className="sm:hidden">{opt.label}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between mb-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Durée restante (jours)</label>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {remainingDays} {remainingDays === 1 ? 'jour' : 'jours'}
          </span>
        </div>

        <div className="hidden sm:block">
          <input
            type="range"
            min="0"
            max="200"
            value={filterDays[1]}
            onChange={(e) => setFilterDays([filterDays[0], parseInt(e.target.value)])}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase">
            <span>Aujourd'hui</span>
            <span>200 jours</span>
          </div>
        </div>

        <div className="sm:hidden flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Seuil max</p>
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <input
              type="number"
              min="0"
              max="200"
              value={filterDays[1]}
              onChange={(e) => setFilterDays([filterDays[0], Math.max(0, Math.min(200, Number(e.target.value) || 0))])}
              className="w-20 bg-transparent text-right text-sm font-bold text-slate-800 outline-none [appearance:textfield]"
            />
            <span className="text-sm font-semibold text-slate-500">jours</span>
          </label>
        </div>
      </div>
    </div>
  );
}