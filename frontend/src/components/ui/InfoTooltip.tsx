import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  text: string[];
  label?: string;
}

function InfoTooltip({ text, label = 'Informations' }: InfoTooltipProps) {
  return (
    <span className="group relative inline-flex shrink-0">
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-secondary/30"
      >
        <HelpCircle size={14} strokeWidth={2.25} />
      </button>

      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 translate-y-1 rounded-2xl bg-primary px-3 py-2 text-left text-xs font-medium leading-5 text-white shadow-lg opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
        {text.map((line, index) => (
          <p key={index} className="mb-1 last:mb-0">
            {line}
          </p>
        ))}
      </span>
    </span>
  );
}

export default InfoTooltip;