import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Server,
  Globe,
  Settings,
  LogOut,
  UserCircle,
  Users,
  Mail
} from 'lucide-react';
import SidebarLink from './SidebarLink';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, restriction: [] },
    { name: 'Serveurs', path: '/servers', icon: Server, restriction: [] },
    { name: 'Domaines', path: '/domains', icon: Globe, restriction: [] },
    { name: 'Destinataires', path: '/recipients', icon: Mail, restriction: [] },
    { name: 'Utilisateurs', path: '/users', icon: Users, restriction: ['admin', 'super_admin'] },
  ];

  const handleDeconnexion = () => {
    logout();
  }

  const roleDisplay = (role: string | undefined) => {
    switch (role) {
      case 'viewer':
        return 'Visiteur';
      case 'editor':
        return 'Éditeur';
      case 'admin':
        return 'Administrateur';
      case 'super_admin':
        return 'Super Administrateur';
      default:
        return role;
    }
  };

  return (
    <aside className="w-64 h-screen bg-primary text-slate-300 flex flex-col  shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-white shadow-lg">
            <UserCircle size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-400 font-medium">{roleDisplay(user?.role)}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          (!item.restriction.length || item.restriction.includes(user?.role || '')) && (
            <SidebarLink key={item.path} to={item.path} icon={item.icon} label={item.name} />
          )
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <SidebarLink to="/settings" icon={Settings} label="Paramètres" />

        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          onClick={handleDeconnexion}
        >
          <LogOut size={20} />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}