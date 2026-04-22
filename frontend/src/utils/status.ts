export const calculateDays = (date: string | null) => {
  if (!date) return null;
  const diff = new Date(date).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getStatusConfig = (days: number | null, isValid: boolean) => {
  if (!isValid || (days !== null && days < 7)) {
    return { color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200', label: 'Critique' };
  }
  if (days !== null && days < 30) {
    return { color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200', label: 'Alerte' };
  }
  return { color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', label: 'Sain' };
};
