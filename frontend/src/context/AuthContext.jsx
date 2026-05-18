import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

// Export Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setLoading(false);
          return;
        }

        const { data } = await authAPI.getMe();

        setUser(data.user);
      } catch (error) {
        console.error('Failed to load user:', error);

        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await authAPI.login({
        email,
        password,
      });

      localStorage.setItem('token', data.token);

      setUser(data.user);

      toast.success(
        `Welcome back, ${data.user.name.split(' ')[0]}! 👋`
      );

      return data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Login failed'
      );

      throw error;
    }
  }, []);

  // Register
  const register = useCallback(async ({ name, email, password, phone }) => {
      try {
        const { data } = await authAPI.register({
          name,
          email,
          password,
          phone,
        });

        localStorage.setItem('token', data.token);

        setUser(data.user);

        toast.success(
          `Welcome to ShopZen, ${name.split(' ')[0]}! 🎉`
        );

        return data;
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Registration failed'
        );

        throw error;
      }
    },
    []
  );

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');

    setUser(null);

    toast.success('Logged out successfully');
  }, []);

  // Update User
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuth: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
};