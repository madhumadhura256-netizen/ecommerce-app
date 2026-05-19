import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingCart, FiHeart, FiUser, FiMenu, FiX,
  FiPackage, FiLogOut, FiSettings, FiSearch
} from 'react-icons/fi';
import { useAuth }  from '../context/AuthContext';
import { useCart }  from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle  from './ThemeToggle';
import SearchBar    from './Searchbar';

export default function Navbar() {
  const { user, logout, isAuth } = useAuth();
  const { cartCount }            = useCart();
  const { isDark }               = useTheme();
  const navigate                 = useNavigate();
  const location                 = useLocation();

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    // ── Header: uses CSS variables so it reacts to light/dark correctly ──
    <header
      className="sticky top-0 z-50 backdrop-blur-md shadow-sm"
      style={{
        background: 'var(--bg-overlay)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🛒</span>
            <span
              className="font-display font-bold text-xl"
              style={{ color: 'var(--text-primary)' }}
            >
              Shop<span className="text-brand-500">Zen</span>
            </span>
          </Link>

          {/* ── Search (desktop) ── */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Mobile search toggle */}
            <button
              className="md:hidden btn-ghost p-2 rounded-lg"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>

            <ThemeToggle />

            {/* Wishlist */}
            {isAuth && (
              <Link
                to="/wishlist"
                className="p-2 relative rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Wishlist"
              >
                <FiHeart size={20} />
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 relative rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Cart"
            >
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </Link>

            {/* User menu */}
            {isAuth ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span
                    className="hidden sm:block text-sm font-medium max-w-[80px] truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 rounded-xl py-2 shadow-xl z-50"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      {/* User info header */}
                      <div
                        className="px-4 py-2"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      >
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {user?.name}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu items */}
                      {[
                        { to: '/account',  icon: FiSettings, label: 'My Account' },
                        { to: '/orders',   icon: FiPackage,  label: 'My Orders'  },
                        { to: '/wishlist', icon: FiHeart,    label: 'Wishlist'   },
                      ].map(({ to, icon: Icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Icon size={16} />
                          {label}
                        </Link>
                      ))}

                      <hr style={{ borderColor: 'var(--border-subtle)', margin: '4px 0' }} />

                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <FiLogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Desktop Login / Sign Up ── */
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm px-3 py-2 rounded-xl font-medium transition-colors"
                  style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile search bar ── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden pb-3"
            >
              <SearchBar onSearch={() => setSearchOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden overflow-hidden py-3 space-y-1"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              {!isAuth ? (
                <>
                  {/* ── Mobile Login ── */}
                  <Link
                    to="/login"
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      color: 'var(--text-primary)',
                      background: 'var(--bg-secondary)',
                    }}
                  >
                    Login
                  </Link>
                  {/* ── Mobile Sign Up ── */}
                  <Link
                    to="/register"
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      color: '#f94a16',           /* brand-500 */
                      background: 'rgba(249,74,22,0.08)',
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/account"
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    My Account
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-500"
                  >
                    Logout
                  </button>
                </>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}