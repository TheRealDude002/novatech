import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiImage,
  FiTag,
  FiLogOut,
  FiHome,
  FiExternalLink,
  FiChevronRight,
} from 'react-icons/fi';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: FiBox },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: FiUsers },
  { to: '/admin/banners', label: 'Banners', icon: FiImage },
  { to: '/admin/categories', label: 'Categories', icon: FiTag },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink text-paper">
      <div className="grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-paper/10 lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-paper/10 p-5">
              <Logo dark />
              <p className="mt-2 font-mono text-2xs uppercase tracking-mono text-paper/50">
                // Admin panel
              </p>
            </div>
            <nav className="flex-1 space-y-1 p-3">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors ${
                      isActive ? 'bg-paper/10 text-paper' : 'text-paper/60 hover:bg-paper/5 hover:text-paper'
                    }`
                  }
                >
                  <span className="flex items-center gap-3">
                    <n.icon className="h-4 w-4" />
                    {n.label}
                  </span>
                  <FiChevronRight className="h-3 w-3" />
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-paper/10 p-3">
              <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-paper/60 hover:text-paper">
                <FiHome className="h-4 w-4" /> Back to store
                <FiExternalLink className="ml-auto h-3 w-3" />
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-paper/60 hover:text-accent"
              >
                <FiLogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
            <div className="border-t border-paper/10 p-3">
              <p className="px-3 font-mono text-2xs uppercase tracking-mono text-paper/40">Signed in as</p>
              <p className="mt-1 px-3 text-sm text-paper">{user?.name}</p>
              <p className="px-3 font-mono text-2xs text-paper/50">{user?.email}</p>
            </div>
          </div>
        </aside>

        <div className="lg:hidden">
          <div className="flex items-center justify-between border-b border-paper/10 p-4">
            <Logo dark />
            <button onClick={() => { logout(); navigate('/'); }} className="text-paper/70 hover:text-accent">
              <FiLogOut className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-b border-paper/10 p-2">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 px-3 py-2 font-mono text-2xs uppercase tracking-mono ${
                    isActive ? 'bg-paper text-ink' : 'text-paper/60 hover:text-paper'
                  }`
                }
              >
                <n.icon className="h-3.5 w-3.5" />
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <main className="overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
