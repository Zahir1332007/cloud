import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Headphones, 
  Cloud, 
  Sparkles, 
  Database, 
  Server, 
  Cpu
} from 'lucide-react';
import api from '../services/api';
import { Product, Category, ProductListResponse } from '../types';
import { ProductCard } from '../components/ProductCard';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get<ProductListResponse>('/products?size=8&sort=rating'),
          api.get<Category[]>('/categories')
        ]);
        setFeaturedProducts(prodRes.data.items);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white py-16 sm:py-24">
        {/* Glow background effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-amber-300">
                <Cloud className="w-4 h-4 text-amber-400" />
                <span>Despliegue Nativo en Amazon Web Services (AWS)</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Tecnología de Vanguardia impulsada por la <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200 bg-clip-text text-transparent">Nube</span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Adquiere laptops profesionales, smartphones y accesorios de alta fidelidad en una plataforma escalable con base de datos PostgreSQL y backend asíncrono FastAPI.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/catalog"
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-105 text-sm"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#cloud-architecture"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 backdrop-blur-md transition-all text-sm flex items-center gap-2"
                >
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>Ver Arquitectura AWS</span>
                </a>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs">
                <div>
                  <span className="block text-2xl font-black text-white">99.9%</span>
                  <span className="text-slate-400">AWS Uptime SLA</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-amber-400">&lt; 50ms</span>
                  <span className="text-slate-400">Latencia API</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-emerald-400">100%</span>
                  <span className="text-slate-400">Free Tier Ready</span>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-2xl p-2 bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
                    alt="MacBook Pro"
                    className="rounded-xl w-full object-cover aspect-video shadow-inner"
                  />
                  <div className="p-4 bg-slate-900/90 rounded-xl mt-2 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-amber-400 font-semibold">Producto Destacado</p>
                      <p className="text-sm font-bold text-white">MacBook Pro 16' M3 Max</p>
                    </div>
                    <span className="text-base font-extrabold text-white">$2,899.99</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Envíos Rápidos</h4>
              <p className="text-xs text-slate-500 mt-1">Despacho garantizado con número de seguimiento en tiempo real.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Transacción Atómica</h4>
              <p className="text-xs text-slate-500 mt-1">PostgreSQL garantiza consistencia ACID en control de inventario.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Soporte Continuo</h4>
              <p className="text-xs text-slate-500 mt-1">Atención personalizada y trazabilidad completa de compras.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Arquitectura AWS</h4>
              <p className="text-xs text-slate-500 mt-1">Instalable en EC2 con Docker Compose y Nginx en segundos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Explorar</span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Categorías Principales</h2>
          </div>
          <Link to="/catalog" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>Ver todo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-slate-900 shadow-md hover:shadow-xl transition-all"
            >
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 opacity-70 group-hover:opacity-60 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4">
                <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-amber-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Top Valorados</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dispositivos Más Populares</h2>
          </div>
          <Link to="/catalog" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>Ver catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                <div className="aspect-[4/3] bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-8 bg-slate-200 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* AWS Cloud Architecture Deep Dive Section */}
      <section id="cloud-architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs mb-4">
              <Cloud className="w-4 h-4" />
              <span>Diseño Arquitectónico Cloud</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Diseñado para Despliegue en AWS Free Tier
            </h2>

            <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
              Esta tienda virtual está concebida bajo las mejores prácticas del <strong>AWS Well-Architected Framework</strong>. Puede desplegarse en una instancia <code>t2.micro</code> o <code>t3.micro</code> de Amazon EC2 usando Docker Compose, garantizando costo cero mensual bajo la capa gratuita.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <Server className="w-5 h-5 text-blue-400 mb-2" />
                <h4 className="font-bold text-sm">Reverse Proxy & SSL</h4>
                <p className="text-xs text-slate-400 mt-1">Nginx gestiona certificados TLS, compresión gzip y enrutamiento a los contenedores.</p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <Cpu className="w-5 h-5 text-amber-400 mb-2" />
                <h4 className="font-bold text-sm">FastAPI Microservice</h4>
                <p className="text-xs text-slate-400 mt-1">Backend Python 3.12 con Uvicorn de alto rendimiento, OpenAPI Docs y JWT.</p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <Database className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="font-bold text-sm">PostgreSQL Relational</h4>
                <p className="text-xs text-slate-400 mt-1">Integridad relacional, transacciones de checkout con bloqueo de fila y persistencia EBS.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/admin"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow"
              >
                <span>Acceder a Métricas Admin</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="/docs"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 flex items-center gap-2"
              >
                <span>Explorar Swagger API</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
