import { NavLink, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  FiUser,
  FiPackage,
  FiMapPin,
  FiHeart,
  FiSettings,
  FiLock,
  FiLogOut,
  FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authApi, orderApi, formatNaira, formatDate } from '../services/api';
import { Spinner, EmptyState } from '../components/ui';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/account', label: 'Profile', icon: FiUser, end: true },
  { to: '/account/orders', label: 'Orders', icon: FiPackage },
  { to: '/account/addresses', label: 'Addresses', icon: FiMapPin },
  { to: '/account/wishlist', label: 'Wishlist', icon: FiHeart },
  { to: '/account/settings', label: 'Settings', icon: FiSettings },
];

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-8 border-b border-ink/10 pb-6">
        <p className="eyebrow text-mist-dark">// Account</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tightest sm:text-5xl">
          Hi, {user?.name?.split(' ')[0]}.
        </h1>
        <p className="mt-2 text-sm text-mist-dark">{user?.email}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        <aside className="md:col-span-3">
          <nav className="space-y-1">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-3 border-l-2 px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'border-accent bg-paper-cool font-medium text-ink'
                      : 'border-transparent text-ink/70 hover:border-ink/20 hover:text-ink'
                  }`
                }
              >
                <span className="flex items-center gap-2">
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </span>
                <FiChevronRight className="h-3 w-3" />
              </NavLink>
            ))}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex w-full items-center gap-2 border-l-2 border-transparent px-3 py-2.5 text-sm text-ink/70 hover:border-accent hover:text-accent"
            >
              <FiLogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </aside>

        <div className="md:col-span-9">
          <Routes>
            <Route index element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="wishlist" element={<AccountWishlist />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/account" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, phone });
      toast.success('Profile saved.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-medium tracking-tighter">Your profile</h2>
      <p className="mt-1 text-sm text-mist-dark">Update the name and phone number we use to contact you.</p>

      <form onSubmit={save} className="mt-6 max-w-md space-y-4">
        <div>
          <label className="field-label">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-base mt-1"
          />
        </div>
        <div>
          <label className="field-label">Email</label>
          <input type="email" value={user?.email || ''} disabled className="input-base mt-1 opacity-60" />
        </div>
        <div>
          <label className="field-label">Phone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-base mt-1" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi
      .mine({ limit: 20 })
      .then(({ data }) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="grid h-32 place-items-center">
        <Spinner className="h-5 w-5" />
      </div>
    );

  if (orders.length === 0)
    return (
      <EmptyState
        icon={FiPackage}
        title="No orders yet."
        message="When you place an order, it will show up here with tracking details."
        action={<Link to="/shop" className="btn-primary">Start shopping</Link>}
      />
    );

  return (
    <div>
      <h2 className="font-display text-2xl font-medium tracking-tighter">Your orders</h2>
      <ul className="mt-6 space-y-4">
        {orders.map((o) => (
          <li key={o._id} className="border border-ink/10 bg-paper-cool">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 p-4">
              <div>
                <p className="font-mono text-2xs uppercase tracking-mono text-mist-dark">Order</p>
                <p className="font-mono text-sm font-medium">{o.orderNumber}</p>
              </div>
              <div>
                <p className="font-mono text-2xs uppercase tracking-mono text-mist-dark">Placed</p>
                <p className="text-sm">{formatDate(o.createdAt)}</p>
              </div>
              <div>
                <p className="font-mono text-2xs uppercase tracking-mono text-mist-dark">Total</p>
                <p className="text-sm font-medium">{formatNaira(o.total)}</p>
              </div>
              <div>
                <span className={`inline-flex px-2 py-1 font-mono text-2xs uppercase tracking-mono ${
                  o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700'
                  : o.status === 'cancelled' ? 'bg-accent-soft text-accent-deep'
                  : 'bg-ink/8 text-ink'
                }`}>
                  {o.status}
                </span>
              </div>
              <Link to={`/order/${o.orderNumber}`} className="btn-outline px-3 py-2">
                View
              </Link>
            </div>
            <ul className="divide-y divide-ink/5">
              {o.items?.slice(0, 2).map((i, idx) => (
                <li key={idx} className="flex items-center gap-3 p-3">
                  <div className="aspect-square w-12 overflow-hidden border border-ink/10">
                    <img src={i.image} alt={i.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-1">{i.title}</p>
                    <p className="font-mono text-2xs uppercase tracking-mono text-mist-dark">Qty {i.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Addresses() {
  const { user, reload } = useAuth();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    label: 'Home', fullName: user?.name || '', phone: user?.phone || '',
    line1: '', line2: '', city: 'Lagos', state: 'Lagos', postalCode: '', country: 'Nigeria', isDefault: false,
  });

  const save = async (e) => {
    e.preventDefault();
    try {
      await authApi.addAddress(form);
      toast.success('Address saved.');
      setAdding(false);
      setForm({ ...form, line1: '', line2: '', postalCode: '', isDefault: false });
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save address.');
    }
  };

  const remove = async (id) => {
    try {
      await authApi.removeAddress(id);
      toast.success('Address removed.');
      reload();
    } catch (err) {
      toast.error('Could not remove address.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tighter">Saved addresses</h2>
          <p className="mt-1 text-sm text-mist-dark">Choose where we deliver your orders.</p>
        </div>
        <button onClick={() => setAdding((s) => !s)} className="btn-primary">
          {adding ? 'Cancel' : 'Add new'}
        </button>
      </div>

      {adding && (
        <form onSubmit={save} className="mt-6 grid gap-4 border border-ink/10 bg-paper-cool p-5 sm:grid-cols-2">
          <div>
            <label className="field-label">Label</label>
            <input className="input-base mt-1" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Full name</label>
            <input className="input-base mt-1" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Phone</label>
            <input className="input-base mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Street address</label>
            <input className="input-base mt-1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
          </div>
          <div>
            <label className="field-label">Apartment / suite</label>
            <input className="input-base mt-1" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
          </div>
          <div>
            <label className="field-label">City</label>
            <input className="input-base mt-1" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="field-label">State</label>
            <input className="input-base mt-1" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Postal code</label>
            <input className="input-base mt-1" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="h-4 w-4 accent-accent" />
            Make this my default address
          </label>
          <button type="submit" className="btn-primary sm:col-span-2">Save address</button>
        </form>
      )}

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {user?.addresses?.length === 0 && (
          <p className="text-sm text-mist-dark">No saved addresses yet. Add one to speed up checkout.</p>
        )}
        {user?.addresses?.map((a) => (
          <li key={a._id} className="border border-ink/10 bg-paper-cool p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-2xs uppercase tracking-mono text-mist-dark">{a.label}</p>
              {a.isDefault && (
                <span className="bg-emerald-100 px-2 py-0.5 font-mono text-2xs uppercase tracking-mono text-emerald-700">Default</span>
              )}
            </div>
            <p className="mt-2 font-medium">{a.fullName}</p>
            <p className="text-sm text-mist-dark">{a.phone}</p>
            <p className="mt-1 text-sm text-mist-dark">
              {a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />
              {a.city}, {a.state}<br />
              {a.country}
            </p>
            <button onClick={() => remove(a._id)} className="mt-3 text-xs text-accent hover:underline">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AccountWishlist() {
  return (
    <div>
      <h2 className="font-display text-2xl font-medium tracking-tighter">Your wishlist</h2>
      <p className="mt-1 text-sm text-mist-dark">All the items you've saved for later.</p>
      <div className="mt-6">
        <WishlistInline />
      </div>
    </div>
  );
}

function WishlistInline() {
  // Defer to the main Wishlist page rendering
  return (
    <Link to="/wishlist" className="btn-outline">
      Open wishlist
      <FiChevronRight className="h-4 w-4" />
    </Link>
  );
}

function Settings() {
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.error('New passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword({ currentPassword: current, newPassword: next });
      toast.success('Password changed.');
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-medium tracking-tighter">Settings</h2>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 font-display text-lg font-medium">
            <FiLock className="h-4 w-4" /> Change password
          </h3>
          <form onSubmit={changePassword} className="mt-4 space-y-3">
            <div>
              <label className="field-label">Current password</label>
              <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="input-base mt-1" required />
            </div>
            <div>
              <label className="field-label">New password</label>
              <input type="password" value={next} onChange={(e) => setNext(e.target.value)} className="input-base mt-1" required />
            </div>
            <div>
              <label className="field-label">Confirm new password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-base mt-1" required />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Update password'}
            </button>
          </form>
        </div>

        <div>
          <h3 className="font-display text-lg font-medium">Account details</h3>
          <dl className="mt-4 space-y-2 border border-ink/10 bg-paper-cool p-4 text-sm">
            <div>
              <dt className="font-mono text-2xs uppercase tracking-mono text-mist-dark">Member since</dt>
              <dd>{formatDate(user?.createdAt)}</dd>
            </div>
            <div>
              <dt className="font-mono text-2xs uppercase tracking-mono text-mist-dark">Last login</dt>
              <dd>{user?.lastLogin ? formatDate(user.lastLogin) : '—'}</dd>
            </div>
            <div>
              <dt className="font-mono text-2xs uppercase tracking-mono text-mist-dark">Account type</dt>
              <dd className="capitalize">{user?.role}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
