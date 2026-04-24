import { RotateCcw} from 'lucide-react';
import { cnFusion } from '@/utils/cnFusion';

interface ResetButtonProps {
  onClick: () => void;
  className?: string;
  size?: number;
  group?: boolean;
}

/**
  * Affiche une carte d'utilisateur avec son nom et son statut.
  * @param {ResetButtonProps} props - Les propriétés du composant.
  * @param {function} props.onClick - La fonction àisLoading appeler lorsque le bouton est cliqué.
  * @param {string} [props.className] - (Optionnel) Classes CSS supplémentaires à appliquer au bouton.
  * @param {number} [props.size=18] - (Optionnel) La taille de l'icône de réinitialisation.
  * @param {boolean} [props.group=true] - (Optionnel) Si true, les animations de rotation sont déclenchées au survol et au clic du groupe. Sinon, elles sont déclenchées au survol et au clic du bouton lui-même.
 */
export function ResetButton({
  onClick,
  className = "",
  size = 18,
  group = true,
}: ResetButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cnFusion(`group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95 disabled:cursor-not-allowed text-secondary-active hover:bg-secondary-50'
        ${className}`)}
    >
      <RotateCcw
        size={size}
        className={`transition-transform duration-500 ease-in-out
          ${group ? 'group-hover:-rotate-90 group-active:-rotate-360' : 'hover:-rotate-90 active:-rotate-360'
          }`}
      />
    </button>
  );
}
