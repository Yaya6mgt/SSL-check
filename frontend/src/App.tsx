import { useEffect, useState } from 'react'

interface Domain {
  id: number;
  hostname: string;
  server?: { name: string };
  checks: {
    isValid: boolean;
    validTo: string | null;
    errorMessage: string | null;
  }[];
}

const calculateDaysRemaining = (validTo: string | null) => {
  if (!validTo) return null;
  const expiry = new Date(validTo).getTime();
  const now = new Date().getTime();
  const diff = expiry - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

function App() {
  const [domains, setDomains] = useState<Domain[]>([])

  useEffect(() => {
    fetch('http://localhost:3000/api/domains')
      .then(res => res.json())
      .then(data => setDomains(data))
      .catch(err => console.error("Erreur API:", err))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">SSL Monitor</h1>
            <p className="text-slate-500">Vue d'ensemble de l'infrastructure Onlineformapro</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm font-medium"
          >
            Actualiser
          </button>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Nom d'hôte</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Serveur</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Jours restants</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {domains.map((domain) => {
                const lastCheck = domain.checks?.[0];
                const days = calculateDaysRemaining(lastCheck?.validTo || null);

                let badgeClass = "bg-gray-100 text-gray-600";
                let statusText = "En attente";

                if (!lastCheck) {
                  statusText = "Non scanné";
                } else if (!lastCheck.isValid) {
                  badgeClass = "bg-red-100 text-red-700";
                  statusText = "Erreur";
                } else if (days !== null) {
                  if (days <= 7) { badgeClass = "bg-red-100 text-red-700"; statusText = "Critique"; }
                  else if (days <= 14) { badgeClass = "bg-orange-100 text-orange-700"; statusText = "Alerte"; }
                  else { badgeClass = "bg-green-100 text-green-700"; statusText = "Sain"; }
                }

                return (
                  <tr key={domain.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{domain.hostname}</td>
                    <td className="px-6 py-4 text-slate-600">{domain.server?.name || '-'}</td>
                    <td className="px-6 py-4">
                      {days !== null ? (
                        <span className={`font-bold ${days <= 14 ? 'text-red-600' : 'text-slate-700'}`}>
                          {days} jours
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClass}`}>
                        {statusText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default App