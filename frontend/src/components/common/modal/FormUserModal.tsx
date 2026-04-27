import React, { useState } from 'react';
import { X, UserPlus, Mail, Lock, Shield, Loader2 } from 'lucide-react';
import { apiFetch } from '@/utils/api';
import type { User as UserType } from '@/types/user.type';
import { Modal } from '../Modal';

interface FormUserModalProps {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: (user: UserType) => void;
}

export default function FormUserModal({ title, isOpen, onClose, onUserAdded }: FormUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'viewer'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token') || '';

    try {
      const newUser = await apiFetch<UserType>('users', {
        method: 'POST',
        body: formData,
        token,
      });
      onUserAdded(newUser);
      setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'viewer' });
      onClose();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || "Ajouter un utilisateur"}
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

          <div className="bg-slate-50 p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-secondary/10 text-secondary rounded-xl">
                <UserPlus size={20} />
              </div>
              <h3 className="font-black uppercase tracking-tight text-sm">Nouvel Utilisateur</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Prénom</label>
                <input
                  required
                  type="text"
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nom</label>
                <input
                  required
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email professionnel</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mot de passe temporaire</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Rôle & Permissions</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <select
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all appearance-none cursor-pointer"
                >
                  <option value="viewer">Lecteur (Consultation seule)</option>
                  <option value="editor">Éditeur (Modif domaines)</option>
                  <option value="admin">Administrateur (Gestion totale)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-800 text-white font-bold py-4 rounded-2xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
              Créer l'utilisateur
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}