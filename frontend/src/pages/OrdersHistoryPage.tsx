import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowRight, Clock, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Order } from '../types';

export const OrdersHistoryPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isAuthenticated) {
      api.get<Order[]>('/orders')
        .then((res) => setOrders(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-32 bg-slate-200 rounded" />
        <div className="h-32 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mis Pedidos</h1>
          <p className="text-xs text-slate-500 mt-0.5">Historial completo de compras registradas en CloudStore</p>
        </div>
        <Link
          to="/catalog"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>Ir a Comprar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Aún no has realizado ninguna compra</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Tus pedidos se guardarán de forma segura en PostgreSQL en la nube de AWS.
          </p>
          <Link
            to="/catalog"
            className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow"
          >
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="font-mono font-bold text-sm text-slate-900">{order.order_number}</span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {order.status}
                  </span>
                  <Link
                    to={`/track?order=${order.order_number}`}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Rastrear
                  </Link>
                </div>
              </div>

              {/* Items Preview */}
              <div className="space-y-1.5 text-xs text-slate-600">
                {order.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span>
                      {it.product_name} <strong className="text-slate-800">x{it.quantity}</strong>
                    </span>
                    <span className="font-semibold text-slate-800">${Number(it.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  Método de pago: <strong className="uppercase font-mono text-slate-700">{order.payment_method}</strong>
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  Total: ${Number(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

