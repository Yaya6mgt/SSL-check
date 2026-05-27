import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { ApiError, apiFetch } from '@/utils/api';
import type { DomainSuggestion } from '@/types/domain-suggestion.type';
import { suggestDomains } from '@/api/domain.api';

interface DomainSuggestionsDropdownProps {
  ipAddress?: string;
  serverId?: number | null;
  className?: string;
  selectedHostnames: string[];
  onSelectedHostnamesChange: (hostnames: string[]) => void;
  hiddenSources?: DomainSuggestion['source'][];
}

function getToken() {
  return localStorage.getItem('token') || undefined;
}

function sourceLabel(source: DomainSuggestion['source']) {
  return source === 'database' ? 'Base de données' : 'Reverse DNS';
}

function sourceStyles(source: DomainSuggestion['source']) {
  return source === 'database'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-sky-50 text-sky-700 border-sky-200';
}

export default function DomainSuggestionsDropdown({
  ipAddress,
  serverId,
  className = '',
  selectedHostnames,
  onSelectedHostnamesChange,
  hiddenSources = []
}: DomainSuggestionsDropdownProps) {
  const [resolvedIp, setResolvedIp] = useState('');
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const visibleSuggestions = suggestions.filter(suggestion => !hiddenSources.includes(suggestion.source));

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    const loadSuggestions = async () => {
      const directIp = ipAddress?.trim() || '';

      if (!directIp && !serverId) {
        setResolvedIp('');
        setSuggestions([]);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        let ipToUse = directIp;

        if (!ipToUse && serverId) {
          const server = await apiFetch<{ ipAddress: string }>(`servers/${serverId}`, {
            token: getToken(),
            signal: controller.signal,
          });
          ipToUse = server.ipAddress?.trim() || '';
        }

        if (!ipToUse) {
          throw new Error('Adresse IP introuvable');
        }

        if (ignore) return;

        setResolvedIp(ipToUse);

        const data = await suggestDomains(ipToUse);

        if (ignore) return;

        setResolvedIp(data.ipAddress || ipToUse);
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        onSelectedHostnamesChange([]);
        setIsOpen(true);
      } catch (err) {
        if (ignore) return;

        setSuggestions([]);

        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Impossible de charger les suggestions');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    const timeoutId = window.setTimeout(loadSuggestions, 300);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [ipAddress, serverId, onSelectedHostnamesChange]);

  if (!ipAddress?.trim() && !serverId) {
    return null;
  }

  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50/80 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <p className="text-sm font-semibold text-slate-800">Suggestions de domaines</p>
          <p className="text-xs text-slate-500">
            {resolvedIp ? `IP utilisée : ${resolvedIp}` : 'Résolution de l IP en cours...'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {isOpen ? (
        <div className="border-t border-slate-200 px-4 py-3">
          {error ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {error}
            </div>
          ) : null}

          {!error && !loading && visibleSuggestions.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune suggestion disponible pour cette adresse.</p>
          ) : null}

          <div className="space-y-2">
            {visibleSuggestions.map((suggestion, index) => (
              <label
                key={`${suggestion.hostname}-${index}`}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedHostnames.includes(suggestion.hostname)}
                    onChange={() => {
                      const next = selectedHostnames.includes(suggestion.hostname)
                        ? selectedHostnames.filter(hostname => hostname !== suggestion.hostname)
                        : [...selectedHostnames, suggestion.hostname];
                      onSelectedHostnamesChange(next);
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-secondary focus:ring-secondary"
                  />
                  <span className="font-mono text-sm text-slate-800 break-all">{suggestion.hostname}</span>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${sourceStyles(suggestion.source)}`}>
                  {sourceLabel(suggestion.source)}
                </span>
              </label>
            ))}
          </div>

          {visibleSuggestions.length > 0 ? (
            <p className="mt-3 text-xs text-slate-500">
              {selectedHostnames.length} domaine{selectedHostnames.length > 1 ? 's' : ''} sélectionné{selectedHostnames.length > 1 ? 's' : ''}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}