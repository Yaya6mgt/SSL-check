/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';
import { User, Lock, Bell, BellOff, UserMinus, ToggleLeft, ToggleRight, Save, Loader2 } from 'lucide-react';

export default function Settings() {
  const { user, login } = useAuth();
  const token = localStorage.getItem('token') || '';

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    password: ''
  });

  const [isRecipient, setIsRecipient] = useState(false);
  const [isRecipientActive, setIsRecipientActive] = useState(false);
  const [isLoadingRecipient, setIsLoadingRecipient] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const checkRecipientStatus = async () => {
      try {
        const data = await apiFetch<{ exists: boolean, isActive?: boolean }>('recipients/exist', { token });
        setIsRecipient(data.exists);
        if (data.isActive !== undefined) setIsRecipientActive(data.isActive);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingRecipient(false);
      }
    };
    checkRecipientStatus();
  }, [token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updatedUser = await apiFetch<any>('users/me', {
        method: 'PUT',
        body: profile,
        token
      });
      login(token, updatedUser);
      alert("Profil mis à jour !");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const addMe = async () => {
    try {
      const res = await apiFetch<any>('recipients/addme', { method: 'POST', token });
      setIsRecipient(true);
      setIsRecipientActive(res.isActive);
    } catch (err: any) { alert(err.message); }
  };

  const toggleMe = async () => {
    try {
      const res = await apiFetch<any>('recipients/toggleme', { method: 'PUT', token });
      setIsRecipientActive(res.isActive);
    } catch (err: any) { alert(err.message); }
  };

  const removeMe = async () => {
    if (!window.confirm("Ne plus recevoir d'alertes par email ?")) return;
    try {
      await apiFetch('recipients/removeme', { method: 'DELETE', token });
      setIsRecipient(false);
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Paramètres</h1>

      <section className="bg-white rounded-4xl border border-slate-200 shadow-sm p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-secondary-50 text-secondary rounded-xl">
            <User size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Mon Profil</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Prénom</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={e => setProfile({...profile, firstName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nom</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={e => setProfile({...profile, lastName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nouveau mot de passe (optionnel)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="password"
                placeholder="Laisser vide pour ne pas changer"
                value={profile.password}
                onChange={e => setProfile({...profile, password: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white font-bold py-3 rounded-2xl hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Enregistrer les modifications
          </button>
        </form>
      </section>

      <section className="bg-white rounded-4xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Bell size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Alertes Email</h2>
        </div>
        <p className="text-slate-500 text-sm mb-6 ml-11">Recevez les rapports d'expiration à l'adresse {user?.email}</p>

        {isLoadingRecipient ? (
          <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-200" /></div>
        ) : !isRecipient ? (
          <button
            onClick={addMe}
            className="w-full flex items-center justify-center gap-2 bg-secondary-50 text-secondary font-bold py-4 rounded-3xl border-2 border-dashed border-secondary-200 hover:bg-secondary-100 transition-all cursor-pointer"
          >
            <Bell size={20} />
            M'ajouter aux destinataires
          </button>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                {isRecipientActive ? <Bell className="text-green-500" /> : <BellOff className="text-slate-400" />}
                <div>
                  <p className="font-bold text-slate-700">{isRecipientActive ? 'Notifications activées' : 'Notifications en pause'}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Statut actuel</p>
                </div>
              </div>
              <button onClick={toggleMe} className="transition-all cursor-pointer">
                {isRecipientActive
                  ? <ToggleRight size={40} className="text-secondary" />
                  : <ToggleLeft size={40} className="text-slate-300" />
                }
              </button>
            </div>

            <button
              onClick={removeMe}
              className="w-full flex items-center justify-center gap-2 text-red-500 font-bold text-sm hover:bg-red-50 py-2 rounded-xl transition-all"
            >
              <UserMinus size={16} />
              Me retirer définitivement de la liste
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
