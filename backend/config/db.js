import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    setTimeout(connectDB, 5000);
  }
};

// Auto-reconnect on drop
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected — retrying in 5s...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

// Keep Atlas free tier awake — ping every 4 minutes
setInterval(async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.db.admin().ping();
    } catch (e) {
      console.warn('Keep-alive ping failed:', e.message);
    }
  }
}, 4 * 60 * 1000);

export default connectDB;