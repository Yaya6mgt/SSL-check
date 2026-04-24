interface DomainsFiltersProps {
  filterStatus: string;
  setFilterStatus: (status: any) => void;
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

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-end gap-8">
      <div className="flex-1 min-w-75">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Statut du certificat</label>
        <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'VALID', label: 'Valides' },
            { id: 'ERROR', label: 'Erreurs' },
            { id: 'EXPIRING', label: 'Expirant < 30j' }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilterStatus(opt.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                filterStatus === opt.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-75">
        <div className="flex justify-between mb-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Durée restante (jours)</label>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {remainingDays} {remainingDays === 1 ? 'jour' : 'jours'}
          </span>
        </div>
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
    </div>
  );
}