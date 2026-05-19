import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar         from './components/Navbar';
import Home           from './pages/Home';
import Login          from './pages/Login';
import Register       from './pages/Register';
import ProductDetail  from './pages/ProductDetail';
import CategoryPage   from './pages/CategoryPage';
import Cart           from './pages/Cart';
import Checkout       from './pages/Checkout';
import OrderTracking  from './pages/OrderTracking';
import PreviousOrders from './pages/PreviousOrders';
import Wishlist       from './pages/Wishlist';
import Account        from './pages/Account';
import AdminDashboard from './pages/AdminDashboard';
import BottomNav      from './components/BottomNav';

/* ── Protected Route ── */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            {/*
              Outer shell:
              - min-h-screen / min-h-dvh  →  fills the full Android viewport
                (100dvh accounts for Chrome's collapsible address bar)
              - flex flex-col             →  Navbar + main content + BottomNav stack vertically
              - overflow-x-hidden         →  prevents horizontal scroll on Android
            */}
            <div
              className="min-h-screen bg-surface-light dark:bg-surface-dark font-body transition-colors duration-300 flex flex-col overflow-x-hidden"
              style={{ minHeight: '100dvh' }}
            >
              {/* Top navbar — sticky, always visible */}
              <Navbar />

              {/*
                Page content area:
                - flex-1          → stretches to fill remaining vertical space
                - pb-safe         → custom class below; adds padding for BottomNav + Android nav bar
                - overflow-y-auto → scroll happens here, not on body
              */}
              <main
                className="flex-1 overflow-y-auto"
                style={{
                  /* Push content above the bottom nav (64px) + Android system nav bar */
                  paddingBottom: 'calc(64px + env(safe-area-inset-bottom))',
                }}
              >
                <Routes>
                  <Route path="/"                   element={<Home />} />
                  <Route path="/login"              element={<Login />} />
                  <Route path="/register"           element={<Register />} />
                  <Route path="/products/:id"       element={<ProductDetail />} />
                  <Route path="/category/:category" element={<CategoryPage />} />
                  <Route path="/cart"               element={<Cart />} />
                  <Route path="/checkout"           element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/orders"             element={<ProtectedRoute><PreviousOrders /></ProtectedRoute>} />
                  <Route path="/orders/:id"         element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                  <Route path="/wishlist"           element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                  <Route path="/account"            element={<ProtectedRoute><Account /></ProtectedRoute>} />
                  <Route path="/admin"              element={<AdminDashboard />} />
                  <Route path="*"                   element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/*
                BottomNav:
                - Stays at bottom of the flex column on mobile
                - Fixed positioning handled inside BottomNav itself (see below)
              */}
              <BottomNav />

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    fontFamily: 'DM Sans, sans-serif',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    /* Prevent toast hiding behind Android status bar */
                    marginTop: 'env(safe-area-inset-top)',
                  },
                  success: { iconTheme: { primary: '#f94a16', secondary: '#fff' } },
                }}
              />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}