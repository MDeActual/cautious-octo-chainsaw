import { useEffect, useState } from 'react';
import type { HealthResponse } from '@cloudmatrix/shared-types';

interface ServiceStatus {
  name: string;
  port: number;
  health: HealthResponse | null;
  error: boolean;
}

export default function DevDashboard(): React.ReactElement {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'identity-service', port: 3001, health: null, error: false },
    { name: 'core-backend', port: 3003, health: null, error: false },
    { name: 'ai-service', port: 3005, health: null, error: false },
  ]);

  useEffect(() => {
    const checkHealth = async (service: ServiceStatus): Promise<ServiceStatus> => {
      try {
        const res = await fetch(`http://localhost:${service.port}/health`);
        const json = (await res.json()) as { data: HealthResponse };
        return { ...service, health: json.data, error: false };
      } catch {
        return { ...service, health: null, error: true };
      }
    };

    void Promise.all(services.map(checkHealth)).then(setServices);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-blue-400">CloudMatrix</span>
          <span className="text-gray-500 text-sm">MSSP Platform</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">dev@localhost</span>
          <span className="text-xs bg-yellow-500 text-black font-semibold px-2 py-0.5 rounded">
            DEV
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold mb-6">Security Dashboard</h2>

        {/* Service health */}
        <section className="mb-8">
          <h3 className="text-lg font-medium text-gray-300 mb-4">Service Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((svc) => (
              <div key={svc.name} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{svc.name}</span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      svc.error
                        ? 'bg-red-500'
                        : svc.health
                          ? 'bg-green-400'
                          : 'bg-yellow-400 animate-pulse'
                    }`}
                  />
                </div>
                <p className="text-gray-400 text-xs">Port {svc.port}</p>
                {svc.health && (
                  <p className="text-gray-500 text-xs mt-1">
                    v{svc.health.version} · {svc.health.status}
                  </p>
                )}
                {svc.error && <p className="text-red-400 text-xs mt-1">Unreachable</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Phase 1 roadmap notice */}
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-6">
          <h3 className="text-blue-300 font-medium mb-2">Phase 1 — In Progress</h3>
          <p className="text-gray-400 text-sm">
            Security assessment, tenant management, CIS scoring, and AI summaries are being
            implemented. This dashboard will populate with live data as services come online.
          </p>
        </div>
      </main>
    </div>
  );
}
