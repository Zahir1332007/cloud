import React, { useEffect, useState } from 'react';
import { Cloud, CheckCircle2, AlertCircle, RefreshCw, Server } from 'lucide-react';
import api from '../services/api';
import { HealthStatus } from '../types';

export const AWSBadge: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await api.get<HealthStatus>('/health');
      setHealth(res.data);
    } catch {
      setHealth({
        status: 'degraded',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        service: 'CloudStore API',
        version: '1.0.0',
        environment: 'offline'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 45000); // 45s health probe
    return () => clearInterval(interval);
  }, []);

  const isHealthy = health?.status === 'healthy';

  return (
    <div className="relative inline-block text-left text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-all border ${
          isHealthy
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
        }`}
        title="Ver estado de infraestructura AWS"
      >
        <Cloud className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">AWS EC2:</span>
        <span className="inline-block w-2 h-2 rounded-full animate-pulse bg-current"></span>
        <span className="font-semibold">{isHealthy ? 'Online' : 'Degraded'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-600" />
              <span className="font-bold text-slate-800 text-sm">Infraestructura AWS</span>
            </div>
            <button
              onClick={checkHealth}
              disabled={loading}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-2 text-slate-600">
            <div className="flex justify-between items-center">
              <span>Instancia Compute:</span>
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                EC2 (t2/t3.micro)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Base de Datos:</span>
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                PostgreSQL (Port 5432)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Proxy Inverso:</span>
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                Nginx (Port 80/443)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Estado API REST:</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                {isHealthy ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saludable
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> En revisión
                  </>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Ambiente:</span>
              <span className="capitalize font-medium text-slate-800">
                {health?.environment || 'production'}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>UNAS Cloud Computing</span>
            <span>v{health?.version || '1.0.0'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
