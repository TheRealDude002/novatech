import { useEffect, useState } from 'react';
import { FiSearch, FiUserCheck, FiUserX, FiUsers } from 'react-icons/fi';
import { userApi, formatDate } from '../../services/api';
import { Spinner, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

/* ------------------------------------------------------------------ */
/*  Customer card (mobile)                                             */
/* ------------------------------------------------------------------ */
function CustomerCard({ u, onToggle }) {
  return (
    <div className="border-b border-paper/5 p-4 first:border-t">
      {/* Name + role badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-paper">{u.name}</p>
            {u.role === 'admin' && (
              <span className="shrink-0 rounded px-1.5 py-0.5 font-mono text-2xs uppercase tracking-mono text-accent">
                admin
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-paper/70">{u.email}</p>
          {u.phone && (
            <p className="mt-0.5 font-mono text-2xs text-paper/50">{u.phone}</p>
          )}
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded px-2 py-1 font-mono text-2xs uppercase tracking-mono ${
            u.isActive
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-accent/15 text-accent'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              u.isActive ? 'bg-emerald-400' : 'bg-accent'
            }`}
          />
          {u.isActive ? 'Active' : 'Disabled'}
        </span>
      </div>

      {/* Joined date + action */}
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-2xs text-paper/50">
          Joined {formatDate(u.createdAt)}
        </span>
        {u.role !== 'admin' && (
          <button
            onClick={() => onToggle(u)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-2xs uppercase tracking-mono transition-colors active:bg-ink-soft ${
              u.isActive
                ? 'border-paper/15 text-paper/70 active:text-accent'
                : 'border-emerald-500/30 text-emerald-400 active:bg-emerald-500/10'
            }`}
          >
            {u.isActive ? (
              <>
                <FiUserX className="h-3 w-3" /> Disable
              </>
            ) : (
              <>
                <FiUserCheck className="h-3 w-3" /> Activate
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    userApi
      .list({ limit: 50, q: search || undefined })
      .then(({ data }) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleActive = async (u) => {
    try {
      await userApi.toggleActive(u._id);
      toast.success(u.isActive ? 'Account deactivated.' : 'Account activated.');
      load();
    } catch {
      toast.error('Could not update account.');
    }
  };

  if (loading) {
    return (
      <div className="grid h-96 place-items-center">
        <Spinner className="h-6 w-6 text-paper" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 border-b border-paper/10 pb-5 sm:mb-8 sm:pb-6">
        <p className="eyebrow text-paper/50">// People</p>
        <h1 className="mt-2 font-display text-2xl font-medium tracking-tightest sm:text-3xl md:text-4xl">
          Customers
        </h1>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2 border border-paper/15 bg-ink-soft/40 px-3">
        <FiSearch className="h-4 w-4 shrink-0 text-paper/50" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="w-full bg-transparent py-3 text-sm text-paper outline-none placeholder:text-paper/40"
        />
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={FiUsers}
          title="No customers found."
          message="Try a different search term."
        />
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="border border-paper/10 sm:hidden">
            {users.map((u) => (
              <CustomerCard key={u._id} u={u} onToggle={toggleActive} />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto border border-paper/10 sm:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-soft/40 font-mono text-2xs uppercase tracking-mono text-paper/60">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper/5">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-ink-soft/30">
                    <td className="px-4 py-3 text-paper">{u.name}</td>
                    <td className="px-4 py-3 text-paper/70">{u.email}</td>
                    <td className="px-4 py-3 text-paper/70">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-paper/70">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-2xs uppercase tracking-mono ${
                          u.role === 'admin' ? 'text-accent' : 'text-paper/60'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 font-mono text-2xs uppercase tracking-mono ${
                          u.isActive
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-accent/15 text-accent'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.isActive ? 'bg-emerald-400' : 'bg-accent'
                          }`}
                        />
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleActive(u)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 font-mono text-2xs uppercase tracking-mono ${
                            u.isActive
                              ? 'border border-paper/15 text-paper/70 hover:border-accent hover:text-accent'
                              : 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          {u.isActive ? (
                            <FiUserX className="h-3 w-3" />
                          ) : (
                            <FiUserCheck className="h-3 w-3" />
                          )}
                          {u.isActive ? 'Disable' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}