import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiShoppingCart, FiHeart, FiUser } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/',          icon: FiHome,         label: 'Home'    },
  { to: '/category/all', icon: FiGrid,      label: 'Browse'  },
  { to: '/cart',      icon: FiShoppingCart, label: 'Cart',  showBadge: true },
  { to: '/wishlist',  icon: FiHeart,        label: 'Saved',  authRequired: true },
  { to: '/account',   icon: FiUser,         label: 'Account', authRequired: true },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const { cartCount } = useCart();
  const { isAuth } = useAuth();

  return (
    <>
      {/*
        Fixed bar at the bottom.
        - sm:hidden       → only shows on mobile (hidden on tablet/desktop)
        - pb safe-area    → clears Android gesture navigation bar
        - z-50            → above page content
      */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'var(--bg-card, #ffffff)',
          borderTop: '1px solid var(--border-default, rgba(0,0,0,0.08))',
          paddingBottom: 'env(safe-area-inset-bottom)',
          /* Subtle shadow so it lifts off the page */
          boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex items-stretch">
          {navItems.map(({ to, icon: Icon, label, showBadge, authRequired }) => {
            /* Hide auth-required items from logged-out users */
            if (authRequired && !isAuth) return null;

            const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));

            return (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors"
                style={{
                  /* 56px minimum tap target — Android accessibility guideline */
                  minHeight: '56px',
                  padding: '8px 4px',
                  color: isActive ? 'var(--accent-gold, #f94a16)' : 'var(--text-muted, #9ca3af)',
                  /* Remove tap highlight flash on Android */
                  WebkitTapHighlightColor: 'transparent',
                  position: 'relative',
                }}
              >
                {/* Active indicator dot above icon */}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 6,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: 'var(--accent-gold, #f94a16)',
                    }}
                  />
                )}

                {/* Icon with optional cart badge */}
                <span className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                  {showBadge && cartCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full text-white font-bold"
                      style={{
                        fontSize: '9px',
                        minWidth: '16px',
                        height: '16px',
                        padding: '0 3px',
                        background: '#f94a16',
                        lineHeight: 1,
                      }}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </span>

                {/* Label */}
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: isActive ? 700 : 400,
                    lineHeight: 1,
                    letterSpacing: '0.01em',
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/*
        Dark mode override — scoped inside this component's rendered output.
        Since this uses inline styles with CSS variables, dark mode is handled
        automatically via the variables set on <html class="dark">.
      */}
    </>
  );
}