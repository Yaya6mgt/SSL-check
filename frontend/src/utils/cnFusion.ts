import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fusionne les classes Tailwind en évitant les conflits.
 */
export function cnFusion(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
