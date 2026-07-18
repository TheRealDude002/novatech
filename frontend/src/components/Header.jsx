import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiShoppingBag,
  FiHeart,
  FiUser,
 FiMenu,
  FiX,
  FiLogOut,
  FiLayout,
  FiChevronDown,
} from 'react-icons/fi';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../services/api';

const NAV_LINKS = [
  { label: 'Shop', to: '/shop' },
  { label: 'Phone Cases', to: '/shop?category=phone-cases' },
  { label: 'Chargers', to: '/shop?category=chargers' },
  { label: 'Earbuds', to: '/shop?category=bluetooth-earbuds' },
  { label: 'Smartwatches', to: '/shop?category=smartwatches' },
  { label: 'Deals', to: '/shop?onSale=true' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(searchTerm.trim())}`);
    setSearchOpen(false);
    setSearchTerm('');
  };

  return (
    <>
      {/* Top thin bar */}
      <div className="bg-ink text-paper">
        <div className="container-page flex h-8 items-center justify-between font-mono text-2xs uppercase tracking-mono text-paper/70">
          <div className="hidden sm:flex items-center gap-4">
            <span>Lekki Phase 1, Lagos</span>
            <span className="h-3 w-px bg-paper/20" />
            <span>Mon–Sat 9–7 · Sun 12–5</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">+234 801 234 5678</span>
            <span className="text-accent">Free shipping over ₦50,000</span>
          </div>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-40 border-b transition-colors',
          scrolled ? 'border-ink/10 bg-paper/95 backdrop-blur-md' : 'border-transparent bg-paper'
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu className="h-5 w-5" />
            </button>
            <Logo />
          </div>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="font-mono text-2xs uppercase tracking-mono text-ink/70 transition-colors hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="Search"
              className="grid h-9 w-9 place-items-center text-ink hover:text-accent"
            >
              <FiSearch className="h-5 w-5" />
            </button>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative grid h-9 w-9 place-items-center text-ink hover:text-accent"
            >
              <FiHeart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[1rem] place-items-center bg-accent px-1 font-mono text-2xs text-paper">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((s) => !s)}
                  className="grid h-9 place-items-center gap-1 px-2 text-ink hover:text-accent sm:flex sm:items-center"
                  aria-label="Account menu"
                >
                  <FiUser className="h-5 w-5" />
                  <span className="hidden font-mono text-2xs uppercase tracking-mono sm:inline">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <FiChevronDown className="hidden h-3 w-3 sm:inline" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 border border-ink/10 bg-paper-cool shadow-soft"
                    >
                      <div className="border-b border-ink/10 px-4 py-3">
                        <div className="font-display text-sm font-medium">{user?.name}</div>
                        <div className="font-mono text-2xs text-mist-dark">{user?.email}</div>
                      </div>
                      <div className="py-2">
                        <Link to="/account" className="block px-4 py-2 text-sm hover:bg-paper">
                          Dashboard
                        </Link>
                        <Link to="/account/orders" className="block px-4 py-2 text-sm hover:bg-paper">
                          My orders
                        </Link>
                        <Link to="/account/wishlist" className="block px-4 py-2 text-sm hover:bg-paper">
                          Wishlist
                        </Link>
                        <Link to="/account/settings" className="block px-4 py-2 text-sm hover:bg-paper">
                          Settings
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-accent hover:bg-paper">
                            <FiLayout className="h-4 w-4" />
                            Admin panel
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            navigate('/');
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-paper"
                        >
                          <FiLogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                aria-label="Sign in"
                className="grid h-9 w-9 place-items-center text-ink hover:text-accent sm:hidden"
              >
                <FiUser className="h-5 w-5" />
              </Link>
            )}

            <Link
              to="/cart"
              aria-label="Cart"
              className="relative grid h-9 w-9 place-items-center text-ink hover:text-accent"
            >
              <FiShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[1rem] place-items-center bg-ink px-1 font-mono text-2xs text-paper">
                  {itemCount}
                </span>
              )}
            </Link>

            {!isAuthenticated && (
              <Link to="/login" className="hidden btn-primary ml-2 px-4 py-2 sm:inline-flex">
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-ink/10"
            >
              <form onSubmit={submitSearch} className="container-page py-4">
                <div className="flex items-center gap-3 border border-ink/15 bg-paper-cool px-4 py-3">
                  <FiSearch className="h-5 w-5 text-mist-dark" />
                  <input
                    autoFocus
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search cases, chargers, earbuds…"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-mist-dark"
                  />
                  <button type="submit" className="btn-primary px-4 py-2">
                    Search
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 flex w-[88%] max-w-sm flex-col bg-paper lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-ink/10 p-4">
                <Logo />
                <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                  {NAV_LINKS.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="block px-3 py-3 font-display text-lg tracking-tight text-ink hover:bg-paper-warm"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="my-6 h-px bg-ink/10" />
                {!isAuthenticated ? (
                  <div className="space-y-2">
                    <Link to="/login" className="block btn-primary w-full">
                      Sign in
                    </Link>
                    <Link to="/register" className="block btn-outline w-full">
                      Create account
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/account" className="block btn-outline w-full">Dashboard</Link>
                    {isAdmin && (
                      <Link to="/admin" className="block btn-accent w-full">Admin panel</Link>
                    )}
                    <button onClick={() => { logout(); navigate('/'); }} className="block btn-ghost w-full">Sign out</button>
                  </div>
                )}
              </nav>
              <div className="border-t border-ink/10 p-4 font-mono text-2xs uppercase tracking-mono text-mist-dark">
                24 Admiralty Way, Lekki Phase 1
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
