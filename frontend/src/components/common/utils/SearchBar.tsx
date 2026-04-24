import { Search } from "lucide-react";
import { cnFusion } from "@/utils/cnFusion";

interface SearchBarProps {
  value: string;
  placeholder?: string;
  className?: string;
  onChange: (value: string) => void;
}

function SearchBar({ value, placeholder, className, onChange }: SearchBarProps) {
  return (
    <div className={cnFusion(`relative mb-6 ${className || ''}`)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
      <input
        type="text"
        placeholder={placeholder || "Rechercher..."}
        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary-300 outline-none transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;