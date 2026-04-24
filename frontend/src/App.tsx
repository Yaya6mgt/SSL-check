import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ServerDetail from './pages/ServerDetail';
import Domains from './pages/Domains';
import MainLayout from './layout/MainLayout';
import Login from './pages/Login';

const PrivateRoute = () => {
  const token = localStorage.getItem('token');

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/server/:id" element={<ServerDetail />} />
            <Route path="/domains" element={<Domains />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;