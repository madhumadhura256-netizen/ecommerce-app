import express from 'express';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import connectDB from './config/db.js';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import locationRoutes from './routes/locationRoutes.js';

// Validate required env vars
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    process.exit(1);
  }
});

const app = express();

// Security & Logging Middleware
app.use(helmet());

app.use(cors({
  origin: ['http://localhost:5173', 'https://shopzen-pi.vercel.app'],
}));

app.use(
  morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined')
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/location', locationRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server only after DB connects
const PORT = process.env.PORT || 5000;

import mongoose from 'mongoose';

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `🚀 ShopZen Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`
    );
  });
});

export default app;