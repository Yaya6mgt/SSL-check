import { Globe } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "../Modal";
import type { IServer } from "@/types/server.type";
import type { DomainSuggestion } from "@/types/domain-suggestion.type";
import { ApiError } from "@/utils/api";
import { suggestDomains } from "@/api/domain.api";

interface FormDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  server: IServer;
  handleAddDomains: (hostnames: string[]) => Promise<void>;
  addLoading: boolean;
}

function normalizeHostname(hostname: string) {
  return hostname.trim().toLowerCase().replace(/\.$/, "");
}

function uniqueHostnames(hostnames: string[]) {
  return [...new Set(hostnames.map(normalizeHostname).filter(Boolean))];
}

function FormDomainModal({ isOpen, onClose, title, server, handleAddDomains, addLoading }: FormDomainModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [manualHostnames, setManualHostnames] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");
  const [inputFeedback, setInputFeedback] = useState("");

  const existingHostnames = useMemo(() => {
    return new Set(
      (server.domains || [])
        .map(domain => normalizeHostname(domain.hostname))
        .filter(Boolean)
    );
  }, [server.domains]);

  const visibleSuggestions = useMemo(() => {
    const filtered = suggestions
      .map(suggestion => ({
        ...suggestion,
        hostname: normalizeHostname(suggestion.hostname),
      }))
      .filter(suggestion => suggestion.hostname && !existingHostnames.has(suggestion.hostname));

    const seen = new Set<string>();
    return filtered.filter(suggestion => {
      if (seen.has(suggestion.hostname)) {
        return false;
      }
      seen.add(suggestion.hostname);
      return true;
    });
  }, [suggestions, existingHostnames]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const ipAddress = server.ipAddress?.trim();
    if (!ipAddress) {
      return;
    }

    let ignore = false;
    const controller = new AbortController();

    const loadSuggestions = async () => {
      setSuggestionsLoading(true);
      setSuggestionsError("");
      try {
        const response = await suggestDomains(ipAddress);

        if (ignore) {
          return;
        }

        setSuggestions(Array.isArray(response.suggestions) ? response.suggestions : []);
      } catch (err) {
        if (ignore) {
          return;
        }

        if (err instanceof ApiError) {
          setSuggestionsError(err.message);
        } else if (err instanceof Error) {
          setSuggestionsError(err.message);
        } else {
          setSuggestionsError("Impossible de charger les suggestions.");
        }
      } finally {
        if (!ignore) {
          setSuggestionsLoading(false);
        }
      }
    };

    loadSuggestions();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [isOpen, server.ipAddress]);

  const domainsToCreate = useMemo(() => {
    return uniqueHostnames([...manualHostnames, ...selectedSuggestions]).filter(hostname => !existingHostnames.has(hostname));
  }, [manualHostnames, selectedSuggestions, existingHostnames]);

  const addManualDomains = () => {
    setInputFeedback("");

    const parsed = inputValue
      .split(/[\n,;\s]+/)
      .map(normalizeHostname)
      .filter(Boolean);

    if (parsed.length === 0) {
      return;
    }

    const alreadyInServer = parsed.filter(hostname => existingHostnames.has(hostname));
    const acceptedHostnames = parsed.filter(hostname => !existingHostnames.has(hostname));

    if (alreadyInServer.length > 0) {
      if (alreadyInServer.length === 1) {
        setInputFeedback(`Le domaine ${alreadyInServer[0]} existe deja dans ce serveur.`);
      } else {
        setInputFeedback(`${alreadyInServer.length} domaines existent deja dans ce serveur.`);
      }
    }

    if (acceptedHostnames.length === 0) {
      return;
    }

    setManualHostnames(prev => uniqueHostnames([...prev, ...acceptedHostnames]));
    setInputValue("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (domainsToCreate.length === 0) {
      return;
    }

    await handleAddDomains(domainsToCreate);
  };

  const removeDomain = (hostnameToRemove: string) => {
    setManualHostnames(prev => prev.filter(hostname => hostname !== hostnameToRemove));
    setSelectedSuggestions(prev => prev.filter(hostname => hostname !== hostnameToRemove));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || "Nouveau domaine"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-secondary-50 p-4 rounded-lg flex items-start gap-3 mb-4">
            <div className="text-secondary mt-0.5"><Globe size={18}/></div>
            <p className="text-xs text-secondary">
              Le domaine sera automatiquement rattaché au serveur <strong>{server.name}</strong>.
            </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Domaines à ajouter</label>
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              placeholder="ex: google.com (Entrée, virgule ou espace pour séparer)"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary outline-none transition-all"
              value={inputValue}
              onChange={e => {
                setInputValue(e.target.value);
                if (inputFeedback) {
                  setInputFeedback("");
                }
              }}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addManualDomains();
                }
              }}
            />
            <button
              type="button"
              onClick={addManualDomains}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50"
            >
              Ajouter
            </button>
          </div>
          {inputFeedback ? (
            <p className="text-xs text-amber-700 mt-1">{inputFeedback}</p>
          ) : null}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-700 mb-2">Suggestions détectées pour l'IP {server.ipAddress}</p>

          {suggestionsLoading ? <p className="text-sm text-slate-500">Chargement des suggestions...</p> : null}

          {suggestionsError ? (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">{suggestionsError}</p>
          ) : null}

          {!suggestionsLoading && !suggestionsError && visibleSuggestions.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune suggestion disponible.</p>
          ) : null}

          <div className="space-y-2 max-h-36 overflow-auto pr-1">
            {visibleSuggestions.map(suggestion => {
              const hostname = suggestion.hostname;
              const checked = selectedSuggestions.includes(hostname);

              return (
                <label key={hostname} className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-md px-2 py-1.5 cursor-pointer">
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedSuggestions(prev => checked
                          ? prev.filter(item => item !== hostname)
                          : uniqueHostnames([...prev, hostname])
                        );
                      }}
                    />
                    <span className="text-sm font-mono text-slate-800 break-all">{hostname}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wide text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5 shrink-0">
                    {suggestion.source === 'database' ? 'base' : 'dns'}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Liste finale ({domainsToCreate.length})</p>
          {domainsToCreate.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun domaine sélectionné pour l'instant.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {domainsToCreate.map(hostname => (
                <span key={hostname} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono">
                  {hostname}
                  <button
                    type="button"
                    className="text-slate-500 hover:text-red-600"
                    onClick={() => removeDomain(hostname)}
                    aria-label={`Supprimer ${hostname}`}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={addLoading || domainsToCreate.length === 0}
            className="w-full bg-secondary text-white py-3 rounded-lg font-bold hover:bg-secondary-hover transition-colors disabled:opacity-50 cursor-pointer"
          >
            {addLoading ? 'Traitement...' : `Ajouter ${domainsToCreate.length} domaine${domainsToCreate.length > 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default FormDomainModal;