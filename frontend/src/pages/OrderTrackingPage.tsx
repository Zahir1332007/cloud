import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, CheckCircle2, Clock, Truck, Check, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Order } from '../types';

export const OrderTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumberInput, setOrderNumberInput] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrder = async (numberToFetch: string) => {
    if (!numberToFetch.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get<Order>(`/orders/track/${numberToFetch.trim().toUpperCase()}`);
      setOrder(res.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'No se encontró ninguna orden con ese código.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get('order');
    if (code) {
      setOrderNumberInput(code);
      fetchOrder(code);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumberInput.trim()) {
      setSearchParams({ order: orderNumberInput.trim() });
      fetchOrder(orderNumberInput.trim());
    }
  };

  const steps = [
    { key: 'pending', label: 'Registrado', desc: 'Orden creada en la base de datos', icon: Clock },
    { key: 'paid', label: 'Pago Confirmado', desc: 'Validación financiera exitosa', icon: CheckCircle2 },
    { key: 'processing', label: 'En Preparación', desc: 'Empaquetado en almacén central', icon: Package },
    { key: 'shipped', label: 'En Camino', desc: 'En ruta de transporte', icon: Truck },
    { key: 'delivered', label: 'Entregado', desc: 'Recibido por el cliente', icon: Check },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'paid': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      default: return 1;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Rastreo de Pedidos en Vivo
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Ingresa el código único de tu compra para verificar el estado de entrega en tiempo real.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={orderNumberInput}
            onChange={(e) => setOrderNumberInput(e.target.value)}
            placeholder="Ejemplo: ORD-20261108-DEMO01"
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm"
          />
          <Package className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Consultando...' : 'Rastrear'}</span>
        </button>
      </form>

      {/* Quick Demo Fill */}
      <div className="text-center text-xs text-slate-500">
        ¿Quieres probar? Haz clic aquí:{' '}
        <button
          onClick={() => {
            setOrderNumberInput('ORD-20261108-DEMO01');
            fetchOrder('ORD-20261108-DEMO01');
          }}
          className="font-mono text-blue-600 font-bold hover:underline"
        >
          ORD-20261108-DEMO01
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2 max-w-xl mx-auto">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Order Status Display */}
      {order && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-8 animate-in fade-in">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Orden de Pedido</span>
              <h2 className="text-xl font-mono font-black text-slate-900">{order.order_number}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fecha: {new Date(order.created_at).toLocaleString('es-ES')}
              </p>
            </div>
            <div>
              <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Estado: {order.status}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="py-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
              {steps.map((s, index) => {
                const Icon = s.icon;
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div key={s.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-all ${
                        isCompleted
                          ? 'bg-blue-600 text-white shadow-blue-500/20'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                        {s.label}
                      </h4>
                      <p className="text-[10px] text-slate-400 hidden sm:block mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details & Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Datos del Destinatario</h4>
              <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-1.5 text-slate-700">
                <p><strong>Cliente:</strong> {order.customer_name}</p>
                <p><strong>Correo:</strong> {order.customer_email}</p>
                <p><strong>Dirección:</strong> {order.shipping_address}</p>
                <p><strong>Teléfono:</strong> {order.phone || 'No especificado'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Resumen de Productos</h4>
              <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-1 border-b border-slate-200/60 last:border-0">
                    <div>
                      <span className="font-semibold text-slate-800">{item.product_name}</span>
                      <span className="text-slate-400 ml-1">x{item.quantity}</span>
                    </div>
                    <span className="font-bold text-slate-900">${Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between font-extrabold text-sm text-slate-900 border-t border-slate-200">
                  <span>Total de la Orden:</span>
                  <span>${Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

