import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Search, 
  User as UserIcon, 
  Menu, 
  X, 
  Package, 
  LayoutDashboard, 
  LogOut,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AWSBadge } from './AWSBadge';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px]">AWS</span>
          <span className="hidden sm:inline">Desplegado en Amazon Web Services (Free Tier Architecture)</span>
          <span className="sm:hidden">AWS Cloud E-Commerce</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/track" className="hover:text-white transition-colors flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>Rastrear Pedido</span>
          </Link>
          <AWSBadge />
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Cloud<span className="text-amber-500">Store</span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-1 font-medium">AWS Cloud Computing</p>
            </div>
          </Link>

          {/* Search Form (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar laptops, smartphones, teclados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-50 focus:bg-white text-sm rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </form>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/catalog"
              className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Catálogo
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[100px] truncate">
                    {user?.full_name?.split(' ')[0]}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">{user?.full_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          Admin AWS
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        Panel de Administración
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
                    >
                      <Package className="w-4 h-4 text-slate-500" />
                      Mis Pedidos
                    </Link>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 font-medium text-left border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Ingresar</span>
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl shadow-sm transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search and Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 space-y-3">
            <form onSubmit={handleSearch} className="px-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-100 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </form>
            <div className="flex flex-col space-y-1 px-2 text-sm font-semibold text-slate-700">
              <Link
                to="/catalog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Catálogo Completo</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </Link>
              <Link
                to="/track"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Rastrear Pedido</span>
                <Package className="w-4 h-4 text-slate-400" />
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-between"
                >
                  <span>Panel Admin</span>
                  <LayoutDashboard className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
