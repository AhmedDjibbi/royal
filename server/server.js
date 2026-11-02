import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import connectDB from './config/db.js';
import { isRedisConnected } from './config/redis.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import diningRoutes from './routes/diningRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import authRoutes from './routes/authRoutes.js';

import Room from './models/Room.js';
import Booking from './models/Booking.js';
import Restaurant from './models/Restaurant.js';
import Review from './models/Review.js';
import Reclamation from './models/Reclamation.js';
import Event from './models/Event.js';
import RoomNight from './models/RoomNight.js';
import { buildNightKeys } from './utils/bookingRules.js';

dotenv.config();

// 1. Setup Server App
const app = express();
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('replace-'))) {
  throw new Error('Set a unique JWT_SECRET of at least 32 characters before starting the API in production.');
}
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost,http://127.0.0.1')
  .split(',').map((origin) => origin.trim()).filter(Boolean);
const apiOrigin = process.env.API_PUBLIC_ORIGIN;
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", ...(apiOrigin && apiOrigin !== 'self' ? [apiOrigin] : [])],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"]
    }
  }
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  }
}));

app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 180, standardHeaders: 'draft-8', legacyHeaders: false }));
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 3. API Mount points
app.use('/api/rooms', roomRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dining', diningRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/events', eventRoutes);

// High-Level Diagnostic API Health Check Endpoint
app.get('/api/status', async (req, res) => {
  try {
    const counts = {
      rooms: await Room.countDocuments({}),
      bookings: await Booking.countDocuments({}),
      restaurants: await Restaurant.countDocuments({}),
      events: await Event.countDocuments({}),
      reviews: await Review.countDocuments({}),
      reclamations: await Reclamation.countDocuments({})
    };

    return res.status(200).json({
      status: 'Online',
      hotelName: 'Royal Talassa Monastir',
      database: 'MongoDB Connected',
      redisCache: isRedisConnected ? 'Active' : 'Soft Fallback (Inactive)',
      databaseRecords: counts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      message: 'Failed to retrieve database counts',
      ...(process.env.NODE_ENV === 'development' ? { error: error.message } : {})
    });
  }
});

// Root friendly welcome view
app.get('/', (req, res) => {
  res.send('👑 Welcome to the Royal Talassa Luxury Hotel Management MVC API Server.');
});

// 4. Centralized Error Handler
app.use((err, req, res, _next) => {
  console.error('💥 Server Exception caught:', err.stack);
  res.status(500).json({
    message: 'An unexpected internal error occurred on the luxury server.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 5. Connect before listening so requests never hit an uninitialized database.
const startServer = async () => {
  await connectDB();
  await RoomNight.init();
  const activeBookings = await Booking.find({ status: { $ne: 'Cancelled' } }).select('_id roomId checkIn checkOut').sort({ checkIn: 1 });
  const activeBookingIds = activeBookings.map((booking) => booking._id);
  await RoomNight.deleteMany({ bookingId: { $nin: activeBookingIds } });
  const lockByNight = new Map();
  activeBookings.forEach((booking) => {
    const nights = Math.round((booking.checkOut - booking.checkIn) / 86_400_000);
    if (nights <= 0) return;
    buildNightKeys(booking.checkIn, nights).forEach((night) => {
      const key = `${booking.roomId}:${night}`;
      if (!lockByNight.has(key)) lockByNight.set(key, { roomId: booking.roomId, night, bookingId: booking._id });
    });
  });
  const lockOperations = [...lockByNight.values()].map(({ roomId, night, bookingId }) => ({
      updateOne: {
        filter: { roomId, night },
        update: { $setOnInsert: { bookingId } },
        upsert: true
      }
    }));
  if (lockOperations.length) await RoomNight.bulkWrite(lockOperations, { ordered: false });
  app.listen(PORT, () => {
    console.log(`👑 Royal Talassa Server running on: http://localhost:${PORT}`);
    console.log(`📡 Health status details: http://localhost:${PORT}/api/status`);
  });
};

startServer().catch((error) => {
  console.error('Could not start the API server:', error.message);
  process.exitCode = 1;
});
