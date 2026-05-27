import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 pt-16 xl:pt-0">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden xl:pt-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}