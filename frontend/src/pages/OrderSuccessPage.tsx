import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Copy, Check, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { Order } from '../types';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Launch celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (orderNumber) {
      api.get<Order>(`/orders/track/${orderNumber}`)
        .then((res) => setOrder(res.data))
        .catch((err) => console.error(err));
    }
  }, [orderNumber]);

  const copyCode = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Orden Procesada con Éxito
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          ¡Gracias por tu compra!
        </h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Tu pedido ha sido registrado atómicamente en la base de datos PostgreSQL y está siendo preparado para despacho.
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-left max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Código de Seguimiento</span>
            <span className="text-lg font-mono font-extrabold text-slate-900">{orderNumber}</span>
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        {order && (
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Cliente:</span>
              <strong className="text-slate-900">{order.customer_name}</strong>
            </div>
            <div className="flex justify-between">
              <span>Correo:</span>
              <strong className="text-slate-900">{order.customer_email}</strong>
            </div>
            <div className="flex justify-between">
              <span>Dirección de Entrega:</span>
              <strong className="text-slate-900">{order.shipping_address}</strong>
            </div>
            <div className="flex justify-between">
              <span>Método de Pago:</span>
              <strong className="text-slate-900 uppercase font-mono">{order.payment_method}</strong>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-extrabold text-slate-900">
              <span>Total Pagado:</span>
              <span>${Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          to={`/track?order=${orderNumber}`}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-md shadow-blue-500/20"
        >
          <Package className="w-4 h-4" /> Rastrear Estado en Vivo
        </Link>
        <Link
          to="/catalog"
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" /> Seguir Comprando
        </Link>
      </div>
    </div>
  );
};

