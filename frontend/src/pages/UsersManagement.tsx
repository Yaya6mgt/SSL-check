import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';
import { Loader2, UserPlus } from 'lucide-react';
import type { User } from '@/types/user.type';
import FormUserModal from '@/components/common/modal/FormUserModal';
import UserCard from '@/components/users_management/UserCard';

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        const data = await apiFetch<User[]>('users', { token });
        const sorted = [...data].sort((a, b) => {
          if (a.id === currentUser?.id) return -1;
          if (b.id === currentUser?.id) return 1;
          return 0;
        });
        if (isMounted) setUsers(sorted);
      } catch (err) {
        console.error("Erreur chargement utilisateurs", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUsers();

    return () => { isMounted = false; };
  }, [token, currentUser?.id]);

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
      console.error(err);
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
      console.error(err);
      alert("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestion des utilisateurs</h1>
        <p className="text-slate-500 font-medium">Administrez les accès et rôles de la plateforme</p>
      </div>

      <button
        onClick={() => setIsAddModalOpen(true)}
        className="flex items-center gap-2 mb-6 bg-secondary text-white font-bold px-6 py-3 rounded-2xl hover:bg-secondary-600 transition-all shadow-lg shadow-secondary-100 w-full sm:w-auto justify-center"
      >
        <UserPlus size={18} />
        Ajouter un utilisateur
      </button>

      <div className="space-y-4">
        {users.map((user) => (
          <UserCard
            key={user.id}
            u={user}
            currentUser={currentUser!}
            updatingId={updatingId}
            handleDelete={handleDelete}
            handleRoleChange={handleRoleChange}
          />
        ))}
      </div>
      <FormUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={(newUser) => setUsers(prev => [newUser, ...prev])}
      />
    </div>
  );
}
