import {
  LayoutDashboard,
  Server,
  Globe,
  Settings,
  LogOut,
  UserCircle
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Serveurs', path: '/servers', icon: Server },
    { name: 'Domaines', path: '/domains', icon: Globe },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 h-screen bg-primary text-slate-300 flex flex-col fixed left-0 top-0 shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-white shadow-lg">
            <UserCircle size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Jean Dupont</p>
            <p className="text-xs text-slate-400 font-medium">Administrateur</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isActive(item.path)
                ? 'bg-secondary text-white shadow-md'
                : 'hover:bg-[#d012425b] hover:text-white'
            }`}
          >
            <item.icon size={20} className={isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-secondary'} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-all"
        >
          <Settings size={20} className="text-slate-400" />
          <span className="font-medium">Paramètres</span>
        </Link>

        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          onClick={() => console.log('Déconnexion...')}
        >
          <LogOut size={20} />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}