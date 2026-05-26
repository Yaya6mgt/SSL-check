import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ServerDetail from './pages/ServerDetail';
import Domains from './pages/Domains';
import Servers from './pages/Servers';
import MainLayout from './layout/MainLayout';
import Login from './pages/Login';
import RecipientsManagement from './pages/RecipientsManagement';
import UsersManagement from './pages/UsersManagement';
import { AuthProvider, useAuth } from './context/AuthContext';
import Settings from './pages/Settings';
import AlertSetting from './pages/AlertSetting';

const PrivateRoute = () => {
  const token = useAuth().token;

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role !== 'admin' && user?.role !== 'super_admin') return <Navigate to="/" replace />;

  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/server/:id" element={<ServerDetail />} />
              <Route path="/domains" element={<Domains />} />
              <Route path="/servers" element={<Servers />} />
              <Route path="/recipients" element={<RecipientsManagement />} />
              <Route path="/settings" element={<Settings />} />
              <Route element={<AdminRoute />}>
                <Route path="/alerts" element={<AlertSetting />} />
                <Route path="/users" element={<UsersManagement />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;