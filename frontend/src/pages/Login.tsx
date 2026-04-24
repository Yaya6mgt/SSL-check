import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_BASE_URL;


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Identifiants invalides');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-3xl bg-secondary text-white shadow-xl shadow-secondary-200 mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">SSL Monitor</h1>
          <p className="text-slate-500 mt-2 font-medium">Accès réservé aux administrateurs</p>
        </div>

        <div className="bg-white p-8 rounded-4xl shadow-sm border border-secondary-200">
          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl animate-shake">
                <AlertCircle size={18} />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@entreprise.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-secondary-50 rounded-2xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-secondary-50 rounded-2xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-4 rounded-2xl shadow-lg shadow-secondary-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-400 text-xs font-medium">
          Plateforme interne v1.0.0<br/>
          Contactez un administrateur IT pour toute demande d'accès.
        </p>
      </div>
    </div>
  );
}

export default Login;