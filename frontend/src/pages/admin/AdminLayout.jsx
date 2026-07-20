import { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
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
  FiMenu,
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

/* ------------------------------------------------------------------ */
/*  Mobile bottom-tab bar shown on < lg screens                        */
/* ------------------------------------------------------------------ */
function MobileBottomNav({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Close sheet on route change
  useEffect(() => { setSheetOpen(false); }, [location.pathname]);

  // Lock body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sheetOpen]);

  const go = useCallback((to) => { setSheetOpen(false); navigate(to); }, [navigate]);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-paper/10 bg-ink lg:hidden">
        {NAV.slice(0, 5).map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2.5 text-paper/50 transition-colors ${
                isActive ? 'text-accent' : 'active:bg-paper/5'
              }`
            }
          >
            <n.icon className="h-5 w-5" />
            <span className="font-mono text-[10px] leading-tight uppercase tracking-mono">
              {n.label}
            </span>
          </NavLink>
        ))}

        {/* "More" button opens sheet for remaining nav + actions */}
        <button
          onClick={() => setSheetOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2.5 text-paper/50 active:bg-paper/5"
          aria-label="More options"
        >
          <FiMenu className="h-5 w-5" />
          <span className="font-mono text-[10px] leading-tight uppercase tracking-mono">More</span>
        </button>
      </nav>

      {/* ---- Slide-up sheet ---- */}
      {sheetOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSheetOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-paper/10 bg-ink p-5 pb-10 lg:hidden">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-paper/20" />

            <h3 className="mb-3 font-mono text-2xs uppercase tracking-mono text-paper/40">
              Navigation
            </h3>
            <div className="space-y-1">
              {NAV.slice(5).map((n) => (
                <button
                  key={n.to}
                  onClick={() => go(n.to)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-left transition-colors ${
                    location.pathname === n.to
                      ? 'bg-paper/10 text-paper'
                      : 'text-paper/60 active:bg-paper/5'
                  }`}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-1 border-t border-paper/10 pt-4">
              <Link
                to="/"
                onClick={() => setSheetOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-paper/60 active:bg-paper/5"
              >
                <FiHome className="h-4 w-4" /> Back to store
                <FiExternalLink className="ml-auto h-3 w-3" />
              </Link>
              <button
                onClick={() => { setSheetOpen(false); onLogout(); }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-accent active:bg-accent/10"
              >
                <FiLogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop sidebar (≥ lg)                                             */
/* ------------------------------------------------------------------ */
function DesktopSidebar({ user, onLogout }) {
  return (
    <aside className="hidden border-r border-paper/10 lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        {/* Branding */}
        <div className="border-b border-paper/10 p-5">
          <Logo dark />
          <p className="mt-2 font-mono text-2xs uppercase tracking-mono text-paper/50">
            // Admin panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-paper/10 text-paper'
                    : 'text-paper/60 hover:bg-paper/5 hover:text-paper'
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

        {/* Footer actions */}
        <div className="border-t border-paper/10 p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-paper/60 hover:bg-paper/5 hover:text-paper"
          >
            <FiHome className="h-4 w-4" /> Back to store
            <FiExternalLink className="ml-auto h-3 w-3" />
          </Link>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-paper/60 hover:bg-paper/5 hover:text-accent"
          >
            <FiLogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        {/* Signed-in user */}
        <div className="border-t border-paper/10 p-3">
          <p className="px-3 font-mono text-2xs uppercase tracking-mono text-paper/40">
            Signed in as
          </p>
          <p className="mt-1 px-3 text-sm text-paper">{user?.name}</p>
          <p className="px-3 font-mono text-2xs text-paper/50">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Main layout                                                        */
/* ------------------------------------------------------------------ */
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ink text-paper">
      {/* Mobile top header — outside the grid so it spans full width */}
      <div className="flex items-center justify-between border-b border-paper/10 p-4 lg:hidden">
        <Logo dark />
        <button
          onClick={handleLogout}
          className="grid h-10 w-10 place-items-center rounded-lg text-paper/70 active:bg-paper/10"
          aria-label="Sign out"
        >
          <FiLogOut className="h-5 w-5" />
        </button>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr]">
        {/* Desktop sidebar */}
        <DesktopSidebar user={user} onLogout={handleLogout} />

        {/* Page content */}
        <main
          className="min-w-0 pb-28 lg:pb-0"
          style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav onLogout={handleLogout} />
    </div>
  );
}