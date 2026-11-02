import Booking from '../models/Booking.js';
import mongoose from 'mongoose';
import Room from '../models/Room.js';
import RoomNight from '../models/RoomNight.js';
import { cacheFlush } from '../config/redis.js';
import { buildNightKeys, calculateStayTotal, parseStayDates, stayRangesOverlap } from '../utils/bookingRules.js';
import { sendServerError } from '../utils/httpErrors.js';

const addonRates = {
  butler: { price: 100, perNight: true },
  spa: { price: 50, perNight: true },
  airport: { price: 80, perNight: false }
};

// POST create stay booking -> Clear Redis cache
export const createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guestsCount, addons } = req.body;

    if (!roomId || !checkIn || !checkOut || guestsCount === undefined) {
      return res.status(400).json({ message: 'Missing required booking fields.' });
    }
    if (!mongoose.isValidObjectId(roomId)) return res.status(400).json({ message: 'Invalid room identifier.' });

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Requested room type does not exist.' });
    }
    if (!room.available) {
      return res.status(409).json({ message: 'This room type is currently unavailable.' });
    }

    // 1. Double check dates collision to prevent overbooking
    const dateRange = parseStayDates(checkIn, checkOut);
    if (dateRange.error) return res.status(400).json({ message: dateRange.error });
    const { start: utcStart, end: utcEnd, nights } = dateRange;
    if (!Number.isInteger(Number(guestsCount)) || Number(guestsCount) < 1 || Number(guestsCount) > room.maxGuests) {
      return res.status(400).json({ message: `Guest count must be between 1 and ${room.maxGuests}.` });
    }
    const selectedAddons = Array.isArray(addons) ? [...new Set(addons)] : [];
    if (selectedAddons.some((addon) => !Object.hasOwn(addonRates, addon))) {
      return res.status(400).json({ message: 'One or more selected add-ons are not available.' });
    }
    const calculatedTotal = calculateStayTotal(room.price, nights, selectedAddons, addonRates);

    const conflictingBookings = await Booking.find({
      roomId,
      status: { $ne: 'Cancelled' },
      checkIn: { $lt: utcEnd },
      checkOut: { $gt: utcStart }
    });

    if (conflictingBookings.some((booking) => stayRangesOverlap(booking.checkIn, booking.checkOut, utcStart, utcEnd))) {
      return res.status(400).json({ message: 'This room is already reserved for the chosen dates. Please choose another date range.' });
    }

    // 2. Perform write to MongoDB
    const newBooking = new Booking({
      roomId,
      userId: req.user._id,
      guestName: req.user.name,
      checkIn: utcStart,
      checkOut: utcEnd,
      guestsCount: parseInt(guestsCount),
      addons: selectedAddons,
      totalAmount: calculatedTotal
    });

    await newBooking.save();
    const reservedNights = buildNightKeys(utcStart, nights).map((night) => ({ roomId, night, bookingId: newBooking._id }));
    try {
      await RoomNight.insertMany(reservedNights);
    } catch (error) {
      await RoomNight.deleteMany({ bookingId: newBooking._id });
      await Booking.deleteOne({ _id: newBooking._id });
      if (error.code === 11000) {
        return res.status(409).json({ message: 'This room was just reserved for part of those dates. Please choose another date range.' });
      }
      throw error;
    }

    // 3. Clear Redis room cache key so list bookings sync up
    await cacheFlush('rt:rooms');

    return res.status(201).json({
      message: 'Luxury booking registered successfully!',
      booking: newBooking
    });
  } catch (error) {
    return sendServerError(res, 'Error processing room reservation.', error);
  }
};

// GET all bookings (Admin)
export const getBookings = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const bookings = await Booking.find(filter).populate('roomId', 'name type image').sort({ createdAt: -1 });
    return res.status(200).json({ bookings });
  } catch (error) {
    return sendServerError(res, 'Error fetching booking list.', error);
  }
};

export const cancelBooking = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid booking identifier.' });
    const filter = { _id: req.params.id, status: { $ne: 'Cancelled' } };
    if (req.user.role !== 'admin') filter.userId = req.user._id;
    if (req.user.role !== 'admin') filter.checkIn = { $gt: new Date() };
    const booking = await Booking.findOneAndUpdate(filter, { $set: { status: 'Cancelled' } }, { new: true });
    if (!booking) {
      const existing = await Booking.findOne({ _id: req.params.id, ...(req.user.role === 'admin' ? {} : { userId: req.user._id }) });
      if (!existing) return res.status(404).json({ message: 'Booking not found.' });
      if (existing.status === 'Cancelled') return res.status(409).json({ message: 'This booking has already been cancelled.' });
      return res.status(409).json({ message: 'A stay that has begun can’t be cancelled online. Please contact guest services.' });
    }
    await RoomNight.deleteMany({ bookingId: booking._id });
    await cacheFlush('rt:rooms');
    return res.json({ message: 'Booking cancelled.', booking });
  } catch (error) {
    return sendServerError(res, 'Could not cancel this booking.', error);
  }
};
