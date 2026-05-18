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
import Searchbar    from './Searchbar';

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
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🛒</span>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
              Shop<span className="text-brand-500">Zen</span>
            </span>
          </Link>

          {/* Search (desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile search */}
            <button
              className="md:hidden btn-ghost p-2"
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>

            <ThemeToggle />

            {/* Wishlist */}
            {isAuth && (
              <Link to="/wishlist" className="btn-ghost p-2 relative" aria-label="Wishlist">
                <FiHeart size={20} />
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="btn-ghost p-2 relative" aria-label="Cart">
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
                  className="flex items-center gap-2 btn-ghost px-2 py-1.5 rounded-xl"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium max-w-[80px] truncate">
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
                      className="absolute right-0 mt-2 w-52 card py-2 shadow-xl border border-gray-100 dark:border-gray-700"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>
                      {[
                        { to: '/account', icon: FiSettings, label: 'My Account' },
                        { to: '/orders',  icon: FiPackage,  label: 'My Orders' },
                        { to: '/wishlist',icon: FiHeart,    label: 'Wishlist' },
                      ].map(({ to, icon: Icon, label }) => (
                        <Link key={to} to={to} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <Icon size={16} />
                          {label}
                        </Link>
                      ))}
                      <hr className="my-1 border-gray-100 dark:border-gray-700" />
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors"
                      >
                        <FiLogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login"    className="btn-ghost text-sm px-3 py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">Sign Up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="sm:hidden btn-ghost p-2"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
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

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden overflow-hidden border-t border-gray-100 dark:border-gray-800 py-3 space-y-1"
            >
              {!isAuth ? (
                <>
                  <Link to="/login"    className="block px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Login</Link>
                  <Link to="/register" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-brand-500">Sign Up</Link>
                </>
              ) : (
                <>
                  <Link to="/account"  className="block px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">My Account</Link>
                  <Link to="/orders"   className="block px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">My Orders</Link>
                  <Link to="/wishlist" className="block px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Wishlist</Link>
                  <button onClick={logout} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-500">Logout</button>
                </>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}