import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSliders,
  FiX,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiSearch,
} from 'react-icons/fi';
import { productApi, categoryApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton, EmptyState } from '../components/ui';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

const PRICE_RANGES = [
  { label: 'Under ₦10,000', min: 0, max: 10000 },
  { label: '₦10,000 – ₦25,000', min: 10000, max: 25000 },
  { label: '₦25,000 – ₦50,000', min: 25000, max: 50000 },
  { label: '₦50,000 – ₦100,000', min: 50000, max: 100000 },
  { label: 'Above ₦100,000', min: 100000, max: 10000000 },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pull filter state from URL
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const selectedBrands = brandParam ? brandParam.split(',').filter(Boolean) : [];
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const featured = searchParams.get('featured') || '';
  const onSale = searchParams.get('onSale') || '';
  const inStock = searchParams.get('inStock') || '';
  const sort = searchParams.get('sort') || 'popular';

  useEffect(() => {
    (async () => {
      try {
        const [cats, brs] = await Promise.all([categoryApi.list(), productApi.brands()]);
        setCategories(cats.data.categories || []);
        setBrands(brs.data.brands || []);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12, sort };
    if (q) params.q = q;
    if (category) params.category = category;
    if (selectedBrands.length) params.brand = selectedBrands.join(',');
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (rating) params.rating = rating;
    if (featured) params.featured = featured;
    if (onSale) params.onSale = onSale;
    if (inStock) params.inStock = inStock;

    productApi
      .list(params)
      .then(({ data }) => {
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
        if (page > (data.pages || 1)) setPage(1);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, brandParam, minPrice, maxPrice, rating, featured, onSale, inStock, sort, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setPage(1);
    setSearchParams(next);
  };

  const toggleBrand = (b) => {
    const next = selectedBrands.includes(b)
      ? selectedBrands.filter((x) => x !== b)
      : [...selectedBrands, b];
    updateParam('brand', next.join(','));
  };

  const setPriceRange = (range) => {
    if (range) {
      updateParam('minPrice', range.min);
      updateParam('maxPrice', range.max);
    } else {
      updateParam('minPrice', '');
      updateParam('maxPrice', '');
    }
  };

  const isPriceActive = (r) => String(r.min) === minPrice && String(r.max) === maxPrice;

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (category) n++;
    if (selectedBrands.length) n++;
    if (minPrice || maxPrice) n++;
    if (rating) n++;
    if (featured) n++;
    if (onSale) n++;
    if (inStock) n++;
    return n;
  }, [category, selectedBrands, minPrice, maxPrice, rating, featured, onSale, inStock]);

  const clearAll = () => {
    setSearchParams(new URLSearchParams());
    setPage(1);
  };

  const activeCategory = categories.find((c) => c.slug === category);

  const FilterPanel = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <p className="eyebrow text-mist-dark">Categories</p>
        <ul className="mt-3 space-y-1">
          <li>
            <button
              onClick={() => updateParam('category', '')}
              className={`block w-full px-2 py-1.5 text-left text-sm transition-colors hover:text-accent ${
                !category ? 'font-medium text-accent' : 'text-ink/80'
              }`}
            >
              All products
            </button>
          </li>
          {categories.map((c) => (
            <li key={c._id}>
              <button
                onClick={() => updateParam('category', c.slug)}
                className={`block w-full px-2 py-1.5 text-left text-sm transition-colors hover:text-accent ${
                  category === c.slug ? 'font-medium text-accent' : 'text-ink/80'
                }`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <p className="eyebrow text-mist-dark">Price</p>
        <ul className="mt-3 space-y-1">
          <li>
            <button
              onClick={() => setPriceRange(null)}
              className={`block w-full px-2 py-1.5 text-left text-sm hover:text-accent ${
                !minPrice && !maxPrice ? 'text-accent' : 'text-ink/80'
              }`}
            >
              Any price
            </button>
          </li>
          {PRICE_RANGES.map((r) => (
            <li key={r.label}>
              <button
                onClick={() => setPriceRange(r)}
                className={`block w-full px-2 py-1.5 text-left text-sm hover:text-accent ${
                  isPriceActive(r) ? 'text-accent' : 'text-ink/80'
                }`}
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <p className="eyebrow text-mist-dark">Brand</p>
          <ul className="mt-3 space-y-1">
            {brands.map((b) => (
              <li key={b}>
                <label className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm text-ink/80 hover:text-ink">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b)}
                    onChange={() => toggleBrand(b)}
                    className="h-3.5 w-3.5 accent-accent"
                  />
                  {b}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick filters */}
      <div>
        <p className="eyebrow text-mist-dark">Filter</p>
        <ul className="mt-3 space-y-1">
          {[
            { key: 'onSale', label: 'On sale' },
            { key: 'inStock', label: 'In stock only' },
            { key: 'featured', label: 'Featured only' },
          ].map((f) => (
            <li key={f.key}>
              <label className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm text-ink/80 hover:text-ink">
                <input
                  type="checkbox"
                  checked={searchParams.get(f.key) === 'true'}
                  onChange={(e) => updateParam(f.key, e.target.checked ? 'true' : '')}
                  className="h-3.5 w-3.5 accent-accent"
                />
                {f.label}
              </label>
            </li>
          ))}
          <li>
            <p className="mt-3 px-2 font-mono text-2xs uppercase tracking-mono text-mist-dark">Rating</p>
            <div className="mt-1 flex gap-1 px-2">
              {[4, 3, 2].map((r) => (
                <button
                  key={r}
                  onClick={() => updateParam('rating', rating === String(r) ? '' : String(r))}
                  className={`border px-2 py-1 font-mono text-2xs ${
                    rating === String(r)
                      ? 'border-accent bg-accent text-paper'
                      : 'border-ink/15 text-ink/70 hover:border-ink'
                  }`}
                >
                  {r}★+
                </button>
              ))}
            </div>
          </li>
        </ul>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="btn-outline w-full"
        >
          Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="container-page py-8 md:py-12">
      {/* Breadcrumb / header */}
      <div className="mb-8 border-b border-ink/10 pb-6">
        <p className="eyebrow text-mist-dark">// Catalog</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl font-medium tracking-tightest sm:text-5xl">
            {activeCategory ? activeCategory.name : q ? `Results for "${q}"` : 'All products'}
          </h1>
          <p className="font-mono text-2xs uppercase tracking-mono text-mist-dark">
            {total} item{total !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Sidebar filters - desktop */}
        <aside className="hidden md:col-span-3 md:block">
          <div className="sticky top-24">
            <FilterPanel />
          </div>
        </aside>

        {/* Main */}
        <div className="md:col-span-9">
          {/* Toolbar */}
          <div className="mb-6 flex items-center justify-between gap-3 border border-ink/10 bg-paper-cool p-2">
            <button
              onClick={() => setFiltersOpen(true)}
              className="btn-outline px-3 py-2 md:hidden"
            >
              <FiSliders className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 grid h-4 min-w-4 place-items-center bg-accent px-1 font-mono text-2xs text-paper">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <p className="hidden font-mono text-2xs uppercase tracking-mono text-mist-dark md:block">
              Page {page} of {Math.max(1, pages)}
            </p>
            <div className="flex items-center gap-2">
              <span className="hidden font-mono text-2xs uppercase tracking-mono text-mist-dark sm:inline">
                Sort by
              </span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="appearance-none border border-ink/15 bg-paper px-3 py-2 pr-8 font-mono text-2xs uppercase tracking-mono text-ink focus:border-ink focus:outline-none"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Active filters chips */}
          {activeFilterCount > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {category && (
                <button
                  onClick={() => updateParam('category', '')}
                  className="inline-flex items-center gap-1 border border-ink/15 px-2 py-1 font-mono text-2xs uppercase tracking-mono text-ink hover:border-accent hover:text-accent"
                >
                  {activeCategory?.name || category}
                  <FiX className="h-3 w-3" />
                </button>
              )}
              {selectedBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => toggleBrand(b)}
                  className="inline-flex items-center gap-1 border border-ink/15 px-2 py-1 font-mono text-2xs uppercase tracking-mono text-ink hover:border-accent hover:text-accent"
                >
                  {b}
                  <FiX className="h-3 w-3" />
                </button>
              ))}
              {onSale === 'true' && (
                <button
                  onClick={() => updateParam('onSale', '')}
                  className="inline-flex items-center gap-1 border border-ink/15 px-2 py-1 font-mono text-2xs uppercase tracking-mono text-ink hover:border-accent hover:text-accent"
                >
                  On sale
                  <FiX className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={FiPackage}
              title="Nothing matches those filters."
              message="Try widening the price range or clearing some filters. We probably have something close to what you're after."
              action={
                <button onClick={clearAll} className="btn-primary">
                  Clear all filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="grid h-10 w-10 place-items-center border border-ink/15 disabled:opacity-40 hover:border-ink hover:bg-ink hover:text-paper"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(7, pages) }).map((_, i) => {
                let p;
                if (pages <= 7) p = i + 1;
                else if (page <= 4) p = i + 1;
                else if (page >= pages - 3) p = pages - 6 + i;
                else p = page - 3 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`grid h-10 w-10 place-items-center border font-mono text-2xs uppercase tracking-mono ${
                      p === page
                        ? 'border-ink bg-ink text-paper'
                        : 'border-ink/15 text-ink hover:border-ink hover:bg-paper-warm'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="grid h-10 w-10 place-items-center border border-ink/15 disabled:opacity-40 hover:border-ink hover:bg-ink hover:text-paper"
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute inset-y-0 right-0 w-[88%] max-w-md overflow-y-auto bg-paper p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-xl font-medium tracking-tighter">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setFiltersOpen(false)}
              className="btn-primary mt-8 w-full"
            >
              Show {total} results
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
