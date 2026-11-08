import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, ShieldCheck, Cpu, Terminal, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      {/* Infrastructure Specs Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <Cloud className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <p className="font-bold text-slate-200">AWS Free Tier Ready</p>
              <p className="text-[11px] text-slate-500">EC2 t2/t3.micro + RDS Postgres</p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <Cpu className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
              <p className="font-bold text-slate-200">FastAPI + Async Python</p>
              <p className="text-[11px] text-slate-500">Alta concurrencia y validación Pydantic</p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
              <p className="font-bold text-slate-200">Seguridad JWT & Nginx</p>
              <p className="text-[11px] text-slate-500">Reverse proxy, SSL y bcrypt</p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <Terminal className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
              <p className="font-bold text-slate-200">Docker Orchestrated</p>
              <p className="text-[11px] text-slate-500">1-click Docker Compose deploy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="text-lg font-extrabold text-white flex items-center gap-1.5">
              Cloud<span className="text-amber-500">Store</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Plataforma de comercio electrónico diseñada con arquitectura moderna de microservicios y contenedores, optimizada para despliegue en la infraestructura Cloud de AWS.
            </p>
            <div className="text-[11px] text-slate-500">
              Proyecto Académico: <strong className="text-slate-300">Cloud Computing (6to Ciclo)</strong>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Navegación</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">Inicio</Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-amber-400 transition-colors">Catálogo de Productos</Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-amber-400 transition-colors">Rastreo de Pedidos</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-amber-400 transition-colors">Carrito de Compras</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Herramientas Cloud</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/api/v1/health"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <span>AWS Health Probe</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <span>API Swagger Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link to="/admin" className="hover:text-amber-400 transition-colors">
                  Panel Administrativo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Credenciales Demo</h4>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] space-y-2 font-mono">
              <div>
                <span className="text-amber-400 block font-semibold">Admin:</span>
                <span className="text-slate-400">admin@cloudstore.com</span>
                <br />
                <span className="text-slate-500">Pass: Admin123!</span>
              </div>
              <div className="pt-1 border-t border-slate-800">
                <span className="text-blue-400 block font-semibold">Cliente:</span>
                <span className="text-slate-400">cliente@cloudstore.com</span>
                <br />
                <span className="text-slate-500">Pass: Cliente123!</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 CloudStore. Desarrollado para Computación en la Nube / AWS.</p>
          <p className="flex items-center gap-1">
            Arquitectura de Software Profesional <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};

