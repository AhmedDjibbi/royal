import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGODB_URI || (process.env.VERCEL ? '' : 'mongodb://localhost:27017/royal-talassa');
let connectionPromise;

const connectDB = async () => {
  if (!mongoURI) throw new Error('MONGODB_URI must be configured.');
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || (process.env.VERCEL ? 5 : 20))
    }).then((connection) => {
      console.log(`🏛️  MongoDB Database Connected: ${connection.connection.host}`);
      return connection.connection;
    }).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  return connectionPromise;
};

export default connectDB;
