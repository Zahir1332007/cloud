import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, cart } = useCart();
  const [justAdded, setJustAdded] = React.useState(false);

  const cartItem = cart.find((item) => item.product.id === product.id);
  const currentInCart = cartItem?.quantity || 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || currentInCart >= product.stock) return;

    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image Link */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.category && (
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {product.category.name}
            </span>
          )}
          {isLowStock && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              ¡Solo quedan {product.stock}!
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Agotado
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
            <span>{Number(product.rating).toFixed(1)}</span>
            <span className="text-slate-400 text-[11px] font-normal ml-0.5">/ 5.0</span>
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Footer: Price & Add Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Precio</span>
            <span className="text-lg font-extrabold text-slate-900">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock || currentInCart >= product.stock}
            className={`p-2.5 rounded-xl font-medium flex items-center justify-center transition-all ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md shadow-blue-600/20'
            }`}
            title={isOutOfStock ? 'Agotado' : 'Añadir al carrito'}
          >
            {justAdded ? (
              <Check className="w-4 h-4 animate-in zoom-in" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
