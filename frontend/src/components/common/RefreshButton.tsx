import { RefreshCw } from 'lucide-react';
import { cnFusion } from '@/utils/cnFusion';

interface RefreshButtonProps {
  label?: string;
  onClick: () => void;
  isLoading: boolean;
  className?: string;
  group?: boolean;
}

/**
  * Affiche une carte d'utilisateur avec son nom et son statut.
  * @param {RefreshButtonProps} props - Les propriétés du composant.
  * @param {string} [props.label=""] - (Optionnel) Le texte à afficher à côté de l'icône de rafraîchissement.
  * @param {function} props.onClick - La fonction à appeler lorsque le bouton est cliqué.
  * @param {boolean} props.isLoading - Indique si une action de rafraîchissement est en cours.
  * @param {string} [props.className] - (Optionnel) Classes CSS supplémentaires à appliquer au bouton.
  * @param {boolean} [props.group=true] - (Optionnel) Si true, les animations de rotation sont déclenchées au survol et au clic du groupe. Sinon, elles sont déclenchées au survol et au clic du bouton lui-même.
 */
export function RefreshButton({
  label,
  onClick,
  isLoading,
  className = "",
  group = true,
}: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cnFusion(`group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold border-2 border-secondary-500 transition-all active:scale-95 disabled:cursor-not-allowed
        ${isLoading
          ? 'bg-slate-100 border-slate-200 text-slate-400'
          : 'border-blue-100 text-secondary-active hover:bg-secondary-50'
        } ${className}`)}
    >
      <RefreshCw
        size={18}
        className={`transition-transform duration-500 ease-in-out
          ${isLoading
            ? 'animate-spin'
            : group ? 'group-hover:rotate-90 group-active:rotate-360' : 'hover:rotate-90 active:rotate-360'
          }`}
      />

      {label && (
        <span className="transition-opacity">
          {isLoading ? 'Scan en cours...' : label}
        </span>
      )}
    </button>
  );
}
