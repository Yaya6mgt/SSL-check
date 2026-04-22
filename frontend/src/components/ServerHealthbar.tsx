import type { Domain } from '@/types/domain.type';
import { calculateDays } from '@/utils/status';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  domains: Domain[];
}

export function ServerHealthBar({ domains }: Props) {
  if (domains.length === 0) return <div className="w-full bg-slate-100 h-2 rounded-full mt-4" />;

  const stats = domains.reduce(
    (acc, domain) => {
      const check = domain.checks?.[0];
      const days = calculateDays(check?.validTo || null);
      const isValid = check?.isValid !== false;

      if (!check || !isValid || (days !== null && days < 7)) acc.red++;
      else if (days !== null && days < 30) acc.orange++;
      else acc.green++;

      return acc;
    },
    { red: 0, orange: 0, green: 0 }
  );

  const total = domains.length;
  const redWidth = (stats.red / total) * 100;
  const orangeWidth = (stats.orange / total) * 100;
  const greenWidth = (stats.green / total) * 100;

  return (
    <div className="mt-4">
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex shadow-inner">
        <div
          style={{ width: `${redWidth}%` }}
          className="h-full bg-red-500 transition-all duration-500"
          title={`${stats.red} Critique(s)`}
        />
        <div
          style={{ width: `${orangeWidth}%` }}
          className="h-full bg-orange-400 transition-all duration-500"
          title={`${stats.orange} Alerte(s)`}
        />
        <div
          style={{ width: `${greenWidth}%` }}
          className="h-full bg-green-500 transition-all duration-500"
          title={`${stats.green} Sain(s)`}
        />
      </div>

      <div className="flex justify-between mt-2 px-0.5 items-center">
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          État du parc
        </span>
        <div className="flex gap-3 items-center">
          {stats.red > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle size={12} className="text-red-500" />
              <span className="text-[10px] text-red-500 font-bold">{stats.red}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-green-500" />
            <span className="text-[10px] text-slate-500">{Math.round(greenWidth)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
