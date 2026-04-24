import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';
import { Shield, User as UserIcon, Mail, Loader2, Trash2 } from 'lucide-react';
import type { User } from '@/types/user.type';

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const token = localStorage.getItem('token') || '';


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiFetch<User[]>('users', { token });
      const sorted = [...data].sort((a, b) => {
        if (a.id === currentUser?.id) return -1;
        if (b.id === currentUser?.id) return 1;
        return 0;
      });
      setUsers(sorted);
    } catch (err) {
      console.error("Erreur chargement utilisateurs", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (targetId: number, newRole: string) => {
    setUpdatingId(targetId);
    try {
      if (newRole === 'admin' && !window.confirm("Êtes-vous sûr de vouloir attribuer le rôle d'administrateur à cet utilisateur ?")) {
        return;
      }
      const updatedUser = await apiFetch<User>(`users/${targetId}/role`, {
        method: 'PUT',
        body: { role: newRole },
        token,
      });

      setUsers(prev => prev.map(u => u.id === targetId ? updatedUser : u));
    } catch (err) {
      alert("Erreur lors de la modification du rôle");
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <Loader2 className="animate-spin mr-2" /> Chargement...
    </div>
  );

  const handleDelete = async (targetId: number, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur ${name} ?`)) {
      return;
    }

    setUpdatingId(targetId);
    try {
      await apiFetch(`users/${targetId}`, {
        method: 'DELETE',
        token,
      });

      setUsers(prev => prev.filter(u => u.id !== targetId));
    } catch (err) {
      alert("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestion des utilisateurs</h1>
        <p className="text-slate-500 font-medium">Administrez les accès et rôles de la plateforme</p>
      </div>

      <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Rôle</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => {
              const isMe = u.id === currentUser?.id;
              const isAdmin = u.role === 'admin';
              const isDisabled = isMe || (isAdmin && u.id !== currentUser?.id);

              return (
                <tr key={u.id} className={`group hover:bg-slate-50/50 transition-colors ${isMe ? 'bg-secondary-50/30' : ''}`}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isMe ? 'bg-secondary text-white' : 'bg-secondary-50 text-slate-600'}`}>
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700 flex items-center gap-2">
                          {u.firstName} {u.lastName}
                          {isMe && <span className="text-[10px] bg-secondary-100 text-secondary px-2 py-0.5 rounded-full uppercase tracking-tighter">Moi</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                      <Mail size={14} className="text-slate-300" />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      u.role === 'admin'
                      ? 'bg-amber-50 text-amber-600 border border-amber-100'
                      : u.role === 'editor'
                      ? 'bg-green-50 text-green-600 border border-green-100'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {u.role === 'admin' ? <Shield size={12} /> : u.role === 'editor' ? <UserIcon size={12} /> : <UserIcon size={12} />}
                      {u.role === 'admin' ? 'Administrateur' : u.role === 'editor' ? 'Éditeur' : 'Lecteur'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-3">
                        {isDisabled ? (
                          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">Accès Protégé</span>
                        ) : (
                          <>
                            <select
                              disabled={updatingId === u.id}
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-secondary-500/10 focus:border-secondary-500 transition-all cursor-pointer hover:border-slate-300"
                            >
                              <option value="viewer">Lecteur</option>
                              <option value="editor">Éditeur</option>
                              <option value="admin">Admin</option>
                            </select>

                            <button
                              onClick={() => handleDelete(u.id, `${u.firstName} ${u.lastName}`)}
                              disabled={updatingId === u.id}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}