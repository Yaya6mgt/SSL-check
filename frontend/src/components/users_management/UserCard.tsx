import type { User } from "@/types/user.type";
import { Crown, Mail, Shield, Trash2, UserIcon } from "lucide-react";

interface UserCardProps {
  u: User;
  currentUser: User;
  updatingId: number | null;
  handleDelete: (userId: number, userName: string) => void;
  handleRoleChange: (userId: number, newRole: string) => void;
}

export default function UserCard({ u, currentUser, updatingId, handleDelete, handleRoleChange }: UserCardProps) {

    const isMe = u.id === currentUser?.id;
    const isAdmin = u.role === 'admin';
    const isSuperAdmin = u.role === 'super_admin';
    const isDisabled = isMe || isSuperAdmin || (isAdmin && currentUser?.role !== 'super_admin' && u.id !== currentUser?.id);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Administrateur';
      case 'admin':
        return 'Administrateur';
      case 'editor':
        return 'Éditeur';
      default:
        return 'Lecteur';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown size={12} />;
      case 'admin':
        return <Shield size={12} />;
      default:
        return <UserIcon size={12} />;
    }
  };

  const getRoleClassName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-50 text-purple-600 border border-purple-100';
      case 'admin':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'editor':
        return 'bg-green-50 text-green-600 border border-green-100';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div
      key={u.id}
      className={`bg-white rounded-xl border border-slate-200 shadow-sm p-4 transition-all hover:border-slate-300 ${
        isMe ? 'bg-secondary-50/30' : ''
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-[30%_25%_20%_20%] gap-4 items-center">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
            isMe ? 'bg-secondary text-white' : 'bg-secondary-50 text-slate-600'
          }`}>
            {u.firstName[0]}{u.lastName[0]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-700 truncate">
                {u.firstName} {u.lastName}
              </h3>
              {isMe && (
                <span className="text-[10px] bg-secondary-100 text-secondary px-2 py-0.5 rounded-full uppercase font-bold tracking-wider shrink-0">
                  Moi
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm min-w-0">
          <Mail size={14} className="text-slate-300 shrink-0" />
          <span className="truncate">{u.email}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${getRoleClassName(u.role)}`}>
            {getRoleIcon(u.role)}
            {getRoleLabel(u.role)}
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 md:pt-0 md:border-0">
          {isDisabled ? (
            <span className="text-[10px] bg-slate-100 text-slate-400 font-bold uppercase tracking-tighter px-2 py-1 rounded">
              Protégé
            </span>
          ) : (
            <>
              <select
                disabled={updatingId === u.id}
                value={u.role}
                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                className="w-full md:w-36 text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-secondary-500/10 focus:border-secondary-500 transition-all cursor-pointer hover:border-slate-300"
              >
                <option value="viewer">Lecteur</option>
                <option value="editor">Éditeur</option>
                <option value="admin">Admin</option>
              </select>

              <button
                onClick={() => handleDelete(u.id, `${u.firstName} ${u.lastName}`)}
                disabled={updatingId === u.id}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0"
                title="Supprimer l'utilisateur"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
