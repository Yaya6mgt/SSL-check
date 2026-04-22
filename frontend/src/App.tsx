import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ServerDetail from './pages/ServerDetail';
import Sidebar from './components/layout/Sidebar';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/server/:id" element={<ServerDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;