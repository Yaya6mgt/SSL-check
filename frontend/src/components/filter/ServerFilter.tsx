import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Minus } from 'lucide-react';
import type { IServer } from '@/types/server.type';

interface ServerFilterProps {
  servers: IServer[];
  selectedServerIds: number[];
  onChange: (ids: number[]) => void;
}

export function ServerFilter({ servers, selectedServerIds, onChange }: ServerFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allSelected = servers.length > 0 && selectedServerIds.length === servers.length;
  const someSelected = selectedServerIds.length > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(servers.map(s => s.id));
    }
  };

  const toggleServer = (id: number) => {
    if (selectedServerIds.includes(id)) {
      onChange(selectedServerIds.filter(sid => sid !== id));
    } else {
      onChange([...selectedServerIds, id]);
    }
  };

  const filteredServers = servers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ipAddress.includes(search)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left w-64" ref={dropdownRef}>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
        Serveur Source
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:border-primary/30 transition-all shadow-sm"
      >
        <span className="truncate">
          {allSelected ? "Tous les serveurs" :
           selectedServerIds.length === 0 ? "Aucun serveur" :
           `${selectedServerIds.length} serveur(s) sélectionnés`}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
          <div className="p-2 border-b border-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-1">
            <button
              onClick={toggleAll}
              className="flex items-center gap-3 w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 mb-1"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${allSelected ? 'bg-primary border-primary text-white' : someSelected ? 'bg-primary/20 border-primary text-primary' : 'border-slate-300'}`}>
                {allSelected ? <Check size={12} /> : someSelected ? <Minus size={12} /> : null}
              </div>
              Tous les serveurs
            </button>

            {filteredServers.map(server => (
              <button
                key={server.id}
                onClick={() => toggleServer(server.id)}
                className="flex items-center gap-3 w-full px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors group"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedServerIds.includes(server.id) ? 'bg-primary border-primary text-white' : 'border-slate-300 group-hover:border-primary/50'}`}>
                  {selectedServerIds.includes(server.id) && <Check size={12} />}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">{server.name}</span>
                  <span className="text-[10px] text-slate-400">{server.ipAddress}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}