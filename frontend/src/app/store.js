import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/authSlice';
import cartReducer from '../redux/cartSlice';
import productReducer from '../redux/productSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
  },
});