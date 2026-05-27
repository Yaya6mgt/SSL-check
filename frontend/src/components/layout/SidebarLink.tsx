import { Link, useLocation } from "react-router-dom";

function SidebarLink({
  to,
  icon: Icon,
  label,
  onNavigate,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  onNavigate?: () => void;
}) {
  const location = useLocation();

  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        isActive
          ? 'bg-secondary text-white shadow-md'
          : 'hover:bg-secondary/30 hover:text-white'
      }`}
    >
      <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-secondary'} />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export default SidebarLink;