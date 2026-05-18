import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/Cartcontext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar      from './components/Navbar';
import Home        from './pages/Home';
import Login       from './pages/Login';
import Register    from './pages/Register';
import ProductDetail  from './pages/ProductDetail';
import CategoryPage   from './pages/CategoryPage';
import Cart           from './pages/Cart';
import Checkout       from './pages/Checkout';
import OrderTracking  from './pages/OrderTracking';
import PreviousOrders from './pages/PreviousOrders';
import Wishlist       from './pages/Wishlist';
import Account        from './pages/Account';
import AdminDashboard from './pages/AdminDashboard';
import BottomNav from "./components/BottomNav";

// Protected Route
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
          <BottomNav/>
            <div className="min-h-screen bg-surface-light dark:bg-surface-dark font-body transition-colors duration-300">
              <Navbar />
              <Routes>
                <Route path="/"                    element={<Home />} />
                <Route path="/login"               element={<Login />} />
                <Route path="/register"            element={<Register />} />
                <Route path="/products/:id"        element={<ProductDetail />} />
                <Route path="/category/:category"  element={<CategoryPage />} />
                <Route path="/cart"                element={<Cart />} />
                <Route path="/checkout"            element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/orders"              element={<ProtectedRoute><PreviousOrders /></ProtectedRoute>} />
                <Route path="/orders/:id"          element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                <Route path="/wishlist"            element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/account"             element={<ProtectedRoute><Account /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*"                    element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    fontFamily: 'DM Sans, sans-serif',
                    borderRadius: '12px',
                    padding: '12px 16px',
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