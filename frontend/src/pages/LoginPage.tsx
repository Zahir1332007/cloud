import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail('admin@cloudstore.com');
    setPassword('Admin123!');
  };

  const fillCustomer = () => {
    setEmail('cliente@cloudstore.com');
    setPassword('Cliente123!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Iniciar Sesión</h1>
        <p className="text-xs text-slate-500">
          Accede a tu cuenta o utiliza las credenciales de prueba preconfiguradas.
        </p>
      </div>

      {/* Quick Test Credential Buttons */}
      <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200/80 space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
          Credenciales de Demostración Rápida
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={fillAdmin}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Rellenar Admin</span>
          </button>
          <button
            type="button"
            onClick={fillCustomer}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <User className="w-3.5 h-3.5" />
            <span>Rellenar Cliente</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Correo Electrónico</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cloudstore.com"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Contraseña</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <span>{loading ? 'Validando en AWS...' : 'Ingresar a CloudStore'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-xs text-slate-500">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/register" className="text-blue-600 font-bold hover:underline">
          Crear cuenta gratuita
        </Link>
      </p>
    </div>
  );
};
