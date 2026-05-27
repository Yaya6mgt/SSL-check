import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Server,
  Globe,
  Settings,
  LogOut,
  UserCircle,
  Users,
  Mail,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import SidebarLink from './SidebarLink';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, restriction: [] },
    { name: 'Serveurs', path: '/servers', icon: Server, restriction: [] },
    { name: 'Domaines', path: '/domains', icon: Globe, restriction: [] },
    { name: 'Destinataires', path: '/recipients', icon: Mail, restriction: [] },
    { name: 'Alertes', path: '/alerts', icon: AlertCircle, restriction: ['admin', 'super_admin'] },
    { name: 'Utilisateurs', path: '/users', icon: Users, restriction: ['admin', 'super_admin'] },
  ];

  const handleDeconnexion = () => {
    logout();
  }

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

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

  const sidebarContent = (
    <>
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
            <SidebarLink key={item.path} to={item.path} icon={item.icon} label={item.name} onNavigate={closeMobileSidebar} />
          )
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <SidebarLink to="/settings" icon={Settings} label="Paramètres" onNavigate={closeMobileSidebar} />

        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          onClick={() => {
            handleDeconnexion();
            closeMobileSidebar();
          }}
        >
          <LogOut size={20} />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-slate-800 bg-primary px-4 text-white shadow-lg xl:hidden">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">SSL-check</p>
          <p className="truncate text-[11px] text-slate-400">Monitoring SSL</p>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen(prev => !prev)}
          className="inline-flex items-center justify-center rounded-xl p-2 text-white transition-colors hover:bg-white/10"
          aria-label={isMobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isMobileOpen ? (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-slate-950/60 backdrop-blur-[2px] xl:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 transform bg-primary text-slate-300 shadow-xl transition-transform duration-300 xl:static xl:top-0 xl:h-screen xl:translate-x-0  ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full hidden xl:block">
          <div className="flex h-full flex-col">
            {sidebarContent}
          </div>
        </div>

        <div className="flex h-full flex-col xl:hidden">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}