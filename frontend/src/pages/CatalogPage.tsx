import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, RefreshCw, X } from 'lucide-react';
import api from '../services/api';
import { Product, Category, ProductListResponse } from '../types';
import { ProductCard } from '../components/ProductCard';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters state from URL params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const minPriceParam = searchParams.get('min_price') || '';
  const maxPriceParam = searchParams.get('max_price') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const inStockParam = searchParams.get('in_stock') === 'true';

  // Fetch categories once
  useEffect(() => {
    api.get<Category[]>('/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch products whenever params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (categoryParam) queryParams.set('category', categoryParam);
        if (searchParam) queryParams.set('search', searchParam);
        if (minPriceParam) queryParams.set('min_price', minPriceParam);
        if (maxPriceParam) queryParams.set('max_price', maxPriceParam);
        if (sortParam) queryParams.set('sort', sortParam);
        if (inStockParam) queryParams.set('in_stock_only', 'true');
        queryParams.set('page', pageParam.toString());
        queryParams.set('size', '12');

        const res = await api.get<ProductListResponse>(`/products?${queryParams.toString()}`);
        setProducts(res.data.items);
        setTotal(res.data.total);
        setPages(res.data.pages);
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, searchParam, minPriceParam, maxPriceParam, sortParam, pageParam, inStockParam]);

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Catálogo Cloud
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Mostrando <span className="font-bold text-slate-800">{total}</span> productos tecnológicos disponibles
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm"
          >
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filtros</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500 hidden sm:inline">Ordenar por:</span>
            <select
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="newest">Más recientes</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
              <option value="rating">Mejor Calificados</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block md:col-span-3 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Filtrar Catálogo</h3>
              {(categoryParam || searchParam || minPriceParam || maxPriceParam || inStockParam) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-blue-600 hover:underline font-semibold"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Categoría</label>
              <div className="space-y-1">
                <button
                  onClick={() => updateParam('category', null)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !categoryParam
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Todas las categorías
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateParam('category', c.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      categoryParam === c.slug
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Rango de Precio ($)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceParam}
                  onChange={(e) => updateParam('min_price', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceParam}
                  onChange={(e) => updateParam('max_price', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={inStockParam}
                  onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : null)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Solo productos en stock</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid & Active Filters */}
        <main className="md:col-span-9 space-y-6">
          {/* Active filter pills */}
          {(categoryParam || searchParam) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Filtros activos:</span>
              {searchParam && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                  Búsqueda: "{searchParam}"
                  <button onClick={() => updateParam('search', null)}>
                    <X className="w-3.5 h-3.5 hover:text-blue-900" />
                  </button>
                </span>
              )}
              {categoryParam && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                  Categoría: {categoryParam}
                  <button onClick={() => updateParam('category', null)}>
                    <X className="w-3.5 h-3.5 hover:text-blue-900" />
                  </button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                  <div className="aspect-[4/3] bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-8 bg-slate-200 rounded mt-4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <Search className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No se encontraron productos</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No hay resultados que coincidan con tus criterios de búsqueda. Intenta limpiar los filtros.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow hover:bg-blue-700"
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-8">
              <button
                disabled={pageParam <= 1}
                onClick={() => updateParam('page', (pageParam - 1).toString())}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-xs font-semibold text-slate-600 px-3">
                Página {pageParam} de {pages}
              </span>
              <button
                disabled={pageParam >= pages}
                onClick={() => updateParam('page', (pageParam + 1).toString())}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer Filter Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">Filtros</h3>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Categoría</label>
                <div className="space-y-1">
                  <button
                    onClick={() => { updateParam('category', null); setIsMobileFilterOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Todas las categorías
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { updateParam('category', c.slug); setIsMobileFilterOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
