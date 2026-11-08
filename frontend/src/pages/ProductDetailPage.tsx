import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  ArrowLeft,
  Server
} from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get<Product>(`/products/${slug}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-10 bg-slate-200 rounded w-3/4" />
            <div className="h-24 bg-slate-200 rounded" />
            <div className="h-12 bg-slate-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Producto no encontrado</h2>
        <p className="text-slate-500 text-sm">El producto que buscas no existe o ha sido descontinuado.</p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Catálogo
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-600">Inicio</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-blue-600">Catálogo</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/catalog?category=${product.category.slug}`} className="hover:text-blue-600">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Product Image */}
        <div className="md:col-span-6 bg-white p-4 sm:p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="aspect-square relative rounded-2xl overflow-hidden bg-slate-50">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.stock <= 5 && product.stock > 0 && (
              <span className="absolute top-4 left-4 bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full shadow">
                ¡Últimas {product.stock} unidades!
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Info & Buy Box */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-2">
            {product.category && (
              <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{Number(product.rating).toFixed(2)}</span>
              <span className="text-xs text-slate-400">| Calificación verificada en AWS</span>
            </div>
          </div>

          {/* Price & Stock */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Precio Especial Cloud</span>
              <span className="text-3xl font-black text-slate-900">${Number(product.price).toFixed(2)}</span>
            </div>
            <div>
              {isOutOfStock ? (
                <span className="bg-red-100 text-red-700 font-bold text-xs px-3 py-1.5 rounded-xl">
                  Sin Stock
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  {product.stock} disponibles en almacén
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción del Producto</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Action Box */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-bold"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-bold disabled:opacity-40"
                >
                  +
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-lg ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" /> ¡Añadido al Carrito!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" /> Añadir al Carrito
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Trust Value Props */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-slate-600 text-xs">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Envío Gratis Nacional</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>12 Meses Garantía</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>30 Días Devolución</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
