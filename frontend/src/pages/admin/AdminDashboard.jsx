import { useEffect, useState } from 'react';
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

const STAT_CARDS = [
  { key: 'monthRevenue', label: 'Revenue this month', icon: FiTrendingUp, format: formatNaira },
  { key: 'totalOrders', label: 'Total orders', icon: FiShoppingBag, format: (v) => v.toLocaleString() },
  { key: 'totalProducts', label: 'Products live', icon: FiBox, format: (v) => v.toLocaleString() },
  { key: 'totalUsers', label: 'Customers', icon: FiUsers, format: (v) => v.toLocaleString() },
];

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

  if (loading)
    return (
      <div className="grid h-96 place-items-center">
        <Spinner className="h-6 w-6 text-paper" />
      </div>
    );

  const maxSale = Math.max(...sales.map((s) => s.revenue), 1);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 border-b border-paper/10 pb-6">
        <p className="eyebrow text-paper/50">// Overview</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tightest sm:text-4xl">
          Dashboard
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((c, i) => {
          const value = stats?.[c.key] ?? 0;
          const isRevenue = c.key === 'monthRevenue';
          const growth = stats?.revenueGrowth ?? 0;
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="border border-paper/10 bg-ink-soft/40 p-5"
            >
              <div className="flex items-center justify-between">
                <c.icon className="h-5 w-5 text-accent" />
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
              <p className="mt-4 font-display text-3xl font-medium tracking-tighter text-paper">
                {c.format(value)}
              </p>
              <p className="mt-1 font-mono text-2xs uppercase tracking-mono text-paper/50">{c.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Low stock alert */}
      {stats?.lowStock > 0 && (
        <div className="mt-6 flex items-center gap-3 border border-accent/30 bg-accent/10 p-4">
          <FiAlertTriangle className="h-5 w-5 text-accent" />
          <div className="flex-1">
            <p className="text-sm text-paper">{stats.lowStock} product(s) are running low on stock.</p>
            <p className="font-mono text-2xs uppercase tracking-mono text-paper/60">Below 5 units left</p>
          </div>
          <Link to="/admin/products" className="btn-accent px-3 py-2">Review</Link>
        </div>
      )}

      {/* Sales chart + categories */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="border border-paper/10 bg-ink-soft/40 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow text-paper/50">// Last 30 days</p>
              <h3 className="mt-1 font-display text-xl font-medium">Sales trend</h3>
            </div>
            <p className="font-mono text-2xs uppercase tracking-mono text-paper/50">
              {sales.length} days
            </p>
          </div>
          <div className="mt-6 flex h-48 items-end gap-1">
            {sales.length === 0 ? (
              <p className="mx-auto text-sm text-paper/50">No sales in this period.</p>
            ) : (
              sales.map((s, i) => (
                <div
                  key={s._id || i}
                  className="group relative flex-1 bg-accent/60 hover:bg-accent"
                  style={{ height: `${(s.revenue / maxSale) * 100}%`, minHeight: '2px' }}
                  title={`${formatDate(s._id)}: ${formatNaira(s.revenue)}`}
                />
              ))
            )}
          </div>
        </div>

        <div className="border border-paper/10 bg-ink-soft/40 p-5">
          <p className="eyebrow text-paper/50">// By category</p>
          <h3 className="mt-1 font-display text-xl font-medium">Revenue split</h3>
          <ul className="mt-4 space-y-3">
            {categories.slice(0, 6).map((c) => {
              const max = categories[0]?.revenue || 1;
              return (
                <li key={c._id}>
                  <div className="flex justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="font-mono text-2xs text-paper/60">{formatNaira(c.revenue)}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-paper/10">
                    <div className="h-full bg-accent" style={{ width: `${(c.revenue / max) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Top products & recent orders */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="border border-paper/10 bg-ink-soft/40 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow text-paper/50">// Best sellers</p>
              <h3 className="mt-1 font-display text-xl font-medium">Top products</h3>
            </div>
            <Link to="/admin/products" className="font-mono text-2xs uppercase tracking-mono text-accent hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {topProducts.map((p, i) => (
              <li key={p._id} className="flex items-center gap-3">
                <span className="font-mono text-2xs text-paper/40">{String(i + 1).padStart(2, '0')}</span>
                <div className="aspect-square w-10 shrink-0 overflow-hidden border border-paper/10 bg-ink">
                  <img src={p.images?.[0]} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="line-clamp-1 text-sm">{p.title}</p>
                  <p className="font-mono text-2xs text-paper/50">{p.sku} · {p.soldCount} sold</p>
                </div>
                <div className="text-sm">{formatNaira(p.salePrice || p.price)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-paper/10 bg-ink-soft/40 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow text-paper/50">// Latest</p>
              <h3 className="mt-1 font-display text-xl font-medium">Recent orders</h3>
            </div>
            <Link to="/admin/orders" className="font-mono text-2xs uppercase tracking-mono text-accent hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {recentOrders.map((o) => (
              <li key={o._id} className="flex items-center gap-3 border-b border-paper/5 pb-2">
                <div className="flex-1">
                  <p className="font-mono text-2xs text-paper">{o.orderNumber}</p>
                  <p className="text-sm text-paper/70">{o.user?.name || 'Guest'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatNaira(o.total)}</p>
                  <p className="font-mono text-2xs uppercase tracking-mono text-paper/50">{o.status}</p>
                </div>
                <Link to={`/order/${o.orderNumber}`} className="text-paper/40 hover:text-accent">
                  <FiArrowUpRight className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
