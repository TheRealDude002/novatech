import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiShoppingBag,
  FiBox,
  FiUsers,
  FiAlertTriangle,
  FiArrowUpRight,
} from 'react-icons/fi';
import { dashboardApi, formatNaira, formatDate } from '../../services/api';
import { Spinner } from '../../components/ui';

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */
const STAT_CARDS = [
  { key: 'monthRevenue', label: 'Revenue this month', icon: FiTrendingUp, format: formatNaira },
  { key: 'totalOrders', label: 'Total orders', icon: FiShoppingBag, format: (v) => v.toLocaleString() },
  { key: 'totalProducts', label: 'Products live', icon: FiBox, format: (v) => v.toLocaleString() },
  { key: 'totalUsers', label: 'Customers', icon: FiUsers, format: (v) => v.toLocaleString() },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Bucket daily sales into weekly buckets for the compact mobile chart. */
function toWeeklyBuckets(sales) {
  if (!sales.length) return [];
  const weeks = [];
  for (let i = 0; i < sales.length; i += 7) {
    const chunk = sales.slice(i, i + 7);
    const revenue = chunk.reduce((sum, s) => sum + s.revenue, 0);
    weeks.push({
      label: chunk[0]?._id ? formatDate(chunk[0]._id) : '',
      revenue,
    });
  }
  return weeks;
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({ stat, index, stats }) {
  const value = stats?.[stat.key] ?? 0;
  const isRevenue = stat.key === 'monthRevenue';
  const growth = stats?.revenueGrowth ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="overflow-hidden border border-paper/10 bg-ink-soft/40 p-4 sm:p-5"
    >
      <div className="flex items-center justify-between">
        <stat.icon className="h-5 w-5 text-accent" />
        {isRevenue && (
          <span
            className={`inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-mono ${
              growth >= 0 ? 'text-emerald-400' : 'text-accent'
            }`}
          >
            {growth >= 0 ? <FiTrendingUp className="h-3 w-3" /> : <FiTrendingDown className="h-3 w-3" />}
            {Math.abs(growth)}%
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-xl font-medium tracking-tighter text-paper sm:text-2xl md:text-3xl">
        {stat.format(value)}
      </p>
      <p className="mt-1 font-mono text-2xs uppercase tracking-mono text-paper/50">
        {stat.label}
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sales bar chart                                                    */
/* ------------------------------------------------------------------ */
function SalesChart({ sales }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 640px)');
    setIsMobile(!mql.matches);
    const handler = (e) => setIsMobile(!e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const chartData = useMemo(() => (isMobile ? toWeeklyBuckets(sales) : sales), [sales, isMobile]);
  const maxSale = Math.max(...chartData.map((s) => s.revenue), 1);

  return (
    <div className="border border-paper/10 bg-ink-soft/40 p-4 sm:p-5 lg:col-span-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-paper/50">
            // {isMobile ? 'Last weeks' : 'Last 30 days'}
          </p>
          <h3 className="mt-1 font-display text-lg font-medium sm:text-xl">Sales trend</h3>
        </div>
        <p className="shrink-0 font-mono text-2xs uppercase tracking-mono text-paper/50">
          {isMobile ? `${chartData.length} weeks` : `${chartData.length} days`}
        </p>
      </div>

      <div className="mt-5 flex h-44 items-end gap-px sm:h-48 sm:gap-1">
        {chartData.length === 0 ? (
          <p className="mx-auto text-sm text-paper/50">No sales in this period.</p>
        ) : (
          chartData.map((s, i) => (
            <div
              key={s.label || i}
              className="group relative flex-1 rounded-t-sm bg-accent/60 active:bg-accent sm:rounded-t-none"
              style={{
                height: `${(s.revenue / maxSale) * 100}%`,
                minHeight: '2px',
              }}
              title={`${s.label}: ${formatNaira(s.revenue)}`}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Category revenue split                                             */
/* ------------------------------------------------------------------ */
function CategorySplit({ categories }) {
  const max = categories[0]?.revenue || 1;

  return (
    <div className="border border-paper/10 bg-ink-soft/40 p-4 sm:p-5">
      <p className="eyebrow text-paper/50">// By category</p>
      <h3 className="mt-1 font-display text-lg font-medium sm:text-xl">Revenue split</h3>

      <ul className="mt-4 space-y-3">
        {categories.slice(0, 6).map((c) => (
          <li key={c._id}>
            <div className="flex justify-between text-sm">
              <span>{c.name}</span>
              <span className="font-mono text-2xs text-paper/60">{formatNaira(c.revenue)}</span>
            </div>
            <div className="mt-1 h-1.5 bg-paper/10">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${(c.revenue / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Top products list                                                  */
/* ------------------------------------------------------------------ */
function TopProducts({ products }) {
  return (
    <div className="overflow-hidden border border-paper/10 bg-ink-soft/40 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow text-paper/50">// Best sellers</p>
          <h3 className="mt-1 font-display text-lg font-medium sm:text-xl">Top products</h3>
        </div>
        <Link
          to="/admin/products"
          className="shrink-0 font-mono text-2xs uppercase tracking-mono text-accent hover:underline"
        >
          View all
        </Link>
      </div>

      <ul className="mt-4 divide-y divide-paper/5">
        {products.map((p, i) => (
          <li key={p._id} className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="w-5 shrink-0 text-right font-mono text-2xs text-paper/40">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="aspect-square h-10 w-10 shrink-0 overflow-hidden border border-paper/10 bg-ink">
              <img src={p.images?.[0]} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{p.title}</p>
              <p className="truncate font-mono text-2xs text-paper/50">
                {p.sku} · {p.soldCount} sold
              </p>
            </div>
            <div className="max-w-[80px] shrink-0 truncate text-right text-sm">{formatNaira(p.salePrice || p.price)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Recent orders list                                                 */
/* ------------------------------------------------------------------ */
function RecentOrders({ orders }) {
  return (
    <div className="overflow-hidden border border-paper/10 bg-ink-soft/40 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow text-paper/50">// Latest</p>
          <h3 className="mt-1 font-display text-lg font-medium sm:text-xl">Recent orders</h3>
        </div>
        <Link
          to="/admin/orders"
          className="shrink-0 font-mono text-2xs uppercase tracking-mono text-accent hover:underline"
        >
          View all
        </Link>
      </div>

      <ul className="mt-4 divide-y divide-paper/5">
        {orders.map((o) => (
          <li key={o._id} className="flex min-w-0 items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-2xs text-paper">{o.orderNumber}</p>
              <p className="truncate text-sm text-paper/70">{o.user?.name || 'Guest'}</p>
            </div>
            <div className="max-w-[90px] shrink-0 text-right">
              <p className="truncate text-sm">{formatNaira(o.total)}</p>
              <p className="truncate font-mono text-2xs uppercase tracking-mono text-paper/50">
                {o.status}
              </p>
            </div>
            <Link to={`/order/${o.orderNumber}`} className="shrink-0 text-paper/40 hover:text-accent">
              <FiArrowUpRight className="h-4 w-4" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.stats(),
      dashboardApi.sales(30),
      dashboardApi.topProducts(5),
      dashboardApi.recentOrders(5),
      dashboardApi.categories(),
    ])
      .then(([s, sa, tp, ro, cat]) => {
        setStats(s.data.stats);
        setSales(sa.data.data || []);
        setTopProducts(tp.data.products || []);
        setRecentOrders(ro.data.orders || []);
        setCategories(cat.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid h-96 place-items-center">
        <Spinner className="h-6 w-6 text-paper" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Page header */}
      <div className="mb-6 border-b border-paper/10 pb-5 sm:mb-8 sm:pb-6">
        <p className="eyebrow text-paper/50">// Overview</p>
        <h1 className="mt-2 font-display text-2xl font-medium tracking-tightest sm:text-3xl md:text-4xl">
          Dashboard
        </h1>
      </div>

      {/* Stat cards — 2 cols on mobile, 4 on lg */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((c, i) => (
          <StatCard key={c.key} stat={c} index={i} stats={stats} />
        ))}
      </div>

      {/* Low stock alert */}
      {stats?.lowStock > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-accent/30 bg-accent/10 p-4 sm:mt-6 sm:flex-row sm:items-center">
          <FiAlertTriangle className="h-5 w-5 shrink-0 text-accent" />
          <div className="flex-1">
            <p className="text-sm text-paper">
              {stats.lowStock} product(s) are running low on stock.
            </p>
            <p className="font-mono text-2xs uppercase tracking-mono text-paper/60">
              Below 5 units left
            </p>
          </div>
          <Link
            to="/admin/products"
            className="btn-accent px-3 py-2 text-center sm:text-left"
          >
            Review
          </Link>
        </div>
      )}

      {/* Sales chart + categories */}
      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-3">
        <SalesChart sales={sales} />
        <CategorySplit categories={categories} />
      </div>

      {/* Top products & recent orders */}
      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-2">
        <TopProducts products={topProducts} />
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
}