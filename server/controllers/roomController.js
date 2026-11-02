import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';
import { parseStayDates } from '../utils/bookingRules.js';
import { sendServerError } from '../utils/httpErrors.js';
import { cacheGet, cacheSet, cacheFlush } from '../config/redis.js';

// GET all rooms (Cached with Redis)
export const getRooms = async (req, res) => {
  try {
    const cacheKey = 'rt:rooms';
    
    // 1. Try fetching from Redis
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      // Return cached results with flag indicating cached source
      const data = req.user?.role === 'admin' ? cachedData : cachedData.map((room) => {
        const safeRoom = { ...room };
        delete safeRoom.bookings;
        return safeRoom;
      });
      return res.status(200).json({ source: 'Redis Cache', data });
    }

    // 2. Cache Miss - Query MongoDB
    const rooms = await Room.find({});
    
    // We also want to attach booking dates dynamically to each room for easy client reading
    const roomsWithBookings = await Promise.all(rooms.map(async (room) => {
      const roomBookings = await Booking.find({ roomId: room._id });
      return {
        ...room.toObject(),
        bookings: roomBookings
      };
    }));

    // 3. Save queried data to Redis Cache (lasts 1 hour)
    await cacheSet(cacheKey, roomsWithBookings, 3600);

    const data = req.user?.role === 'admin' ? roomsWithBookings : roomsWithBookings.map((room) => {
      const safeRoom = { ...room };
      delete safeRoom.bookings;
      return safeRoom;
    });
    return res.status(200).json({ source: 'MongoDB Database', data });
  } catch (error) {
    return sendServerError(res, 'Error retrieving rooms catalog.', error);
  }
};

// POST check availability for room (No cache since dates are dynamic)
export const checkRoomAvailability = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;
    
    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({ message: 'Missing parameters. Need roomId, checkIn, and checkOut dates.' });
    }
    if (!mongoose.isValidObjectId(roomId)) return res.status(400).json({ message: 'Invalid room identifier.' });
    const room = await Room.findById(roomId).select('available');
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    if (!room.available) return res.status(200).json({ available: false, message: 'This room type is currently unavailable.' });
    const dateRange = parseStayDates(checkIn, checkOut);
    if (dateRange.error) return res.status(400).json({ message: dateRange.error });
    const { start, end } = dateRange;

    // Overlap condition: (StartA <= EndB) and (EndA >= StartB)
    const conflictingBookings = await Booking.find({
      roomId,
      status: { $ne: 'Cancelled' },
      checkIn: { $lt: end },
      checkOut: { $gt: start }
    });

    if (conflictingBookings.length > 0) {
      return res.status(200).json({ available: false, message: 'Room already booked for selected dates.' });
    }

    return res.status(200).json({ available: true, message: 'Room is available!' });
  } catch (error) {
    return sendServerError(res, 'Error checking room availability.', error);
  }
};

// PUT update price (Admin) -> Invalidate cache
export const updateRoomPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (price === undefined || !Number.isFinite(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({ message: 'Please provide a valid numeric room price.' });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      { price: parseFloat(price) },
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    // Flush Cache to force refresh on next load
    await cacheFlush('rt:rooms');

    return res.status(200).json({ message: 'Room price adjusted successfully.', room: updatedRoom });
  } catch (error) {
    return sendServerError(res, 'Error modifying room price.', error);
  }
};

// PUT toggle availability status (Admin) -> Invalidate cache
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.available = !room.available;
    await room.save();

    // Flush Cache to update client visibility
    await cacheFlush('rt:rooms');

    return res.status(200).json({ message: `Room availability set to ${room.available}`, room });
  } catch (error) {
    return sendServerError(res, 'Error toggling room service availability.', error);
  }
};
