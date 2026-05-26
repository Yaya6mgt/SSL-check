import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/utils/api';
import { Mail, Loader2, Trash2, UserPlus, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Recipient {
  id: number;
  email: string;
  isActive: boolean;
}

export default function RecipientsManagement() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('token') || '';
  const { user } = useAuth();
  const myRole = user?.role || 'viewer';

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const data = await apiFetch<Recipient[]>('recipients', { token });
        setRecipients(data);
      } catch (err) {
        console.error("Erreur chargement destinataires", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipients();
  }, [token]);

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setIsSubmitting(true);
    try {
      const created = await apiFetch<Recipient>('recipients', {
        method: 'POST',
        body: { email: newEmail },
        token,
      });
      setRecipients(prev => [...prev, created]);
      setNewEmail('');
    } catch {
      alert("Erreur lors de l'ajout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    if (myRole === 'viewer') return;
    try {
      const updated = await apiFetch<Recipient>(`recipients/${id}`, {
        method: 'PUT',
        body: { isActive: !currentStatus },
        token,
      });
      setRecipients(prev => prev.map(r => r.id === id ? updated : r));
    } catch {
      alert("Erreur lors de la modification du statut");
    }
  };

  const handleDelete = async (id: number, email: string) => {
    if (!window.confirm(`Supprimer ${email} de la liste des alertes ?`)) return;
    try {
      await apiFetch(`recipients/${id}`, { method: 'DELETE', token });
      setRecipients(prev => prev.filter(r => r.id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-secondary" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Destinataires des alertes</h1>
          <p className="text-slate-500 font-medium text-sm">Emails recevant les notifications d'expiration SSL</p>
        </div>
      </div>
      {myRole !== 'viewer' && (
        <form onSubmit={handleAddRecipient} className="mb-8 flex gap-3 p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
            placeholder="nouvel.email@entreprise.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
            required
          />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-secondary hover:bg-secondary-600 text-white font-bold px-6 py-3 rounded-2xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
            Ajouter
          </button>
        </form>
      )}

      <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
        {recipients.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-medium">Aucun destinataire configuré.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recipients.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{r.email}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(r.id, r.isActive)}
                      className={`mx-auto flex items-center gap-2 font-bold text-xs transition-colors ${r.isActive ? 'text-green-600' : 'text-slate-400'}`}
                    >
                      {r.isActive ? <ToggleRight size={28} className="text-green-500" /> : <ToggleLeft size={28} />}
                      {r.isActive ? 'ACTIF' : 'INACTIF'}
                    </button>
                  </td>
                  {myRole !== 'viewer' ? (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(r.id, r.email)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  ) : (
                    <td className="px-6 py-4 text-right text-slate-400 italic">Accès protégé</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}