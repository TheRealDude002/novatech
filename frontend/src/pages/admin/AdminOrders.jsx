import { useEffect, useState } from 'react';
import { FiSearch, FiShoppingBag, FiChevronDown } from 'react-icons/fi';
import { orderApi, formatNaira, formatDate } from '../../services/api';
import { Spinner, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    orderApi
      .all(params)
      .then(({ data }) => {
        setOrders(data.orders || []);
        setPages(data.pages || 1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id, status) => {
    try {
      await orderApi.updateStatus(id, { status });
      toast.success(`Order marked as ${status}.`);
      load();
    } catch (err) {
      toast.error('Could not update status.');
    }
  };

  if (loading)
    return (
      <div className="grid h-96 place-items-center">
        <Spinner className="h-6 w-6 text-paper" />
      </div>
    );

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 border-b border-paper/10 pb-6">
        <p className="eyebrow text-paper/50">// Operations</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tightest sm:text-4xl">Orders</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 border border-paper/15 bg-ink-soft/40 px-3">
          <FiSearch className="h-4 w-4 text-paper/50" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number, customer…"
            className="flex-1 bg-transparent py-3 text-sm text-paper outline-none placeholder:text-paper/40"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="appearance-none border border-paper/15 bg-ink-soft px-4 py-3 pr-10 font-mono text-2xs uppercase tracking-mono text-paper"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-paper/50" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FiShoppingBag}
          title="No orders found."
          message="Try a different filter or search term."
        />
      ) : (
        <div className="overflow-x-auto border border-paper/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-soft/40 font-mono text-2xs uppercase tracking-mono text-paper/60">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper/5">
              {filtered.map((o) => (
                <tr key={o._id} className="hover:bg-ink-soft/30">
                  <td className="px-4 py-3 font-mono text-2xs text-paper">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div className="text-paper">{o.user?.name || 'Guest'}</div>
                    <div className="font-mono text-2xs text-paper/50">{o.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-paper/70">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3">{formatNaira(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 font-mono text-2xs uppercase tracking-mono ${
                      o.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400'
                      : o.status === 'cancelled' ? 'bg-accent/20 text-accent'
                      : 'bg-paper/10 text-paper/70'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        className="appearance-none border border-paper/15 bg-ink px-3 py-1.5 pr-8 font-mono text-2xs uppercase tracking-mono text-paper"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-paper/50" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`grid h-9 w-9 place-items-center border font-mono text-2xs uppercase tracking-mono ${
                page === i + 1
                  ? 'border-paper bg-paper text-ink'
                  : 'border-paper/15 text-paper/70 hover:border-paper'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
