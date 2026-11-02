import Restaurant from '../models/Restaurant.js';
import mongoose from 'mongoose';
import { cacheGet, cacheSet, cacheFlush } from '../config/redis.js';
import { isDiningSlotTaken } from '../utils/bookingRules.js';
import { sendServerError } from '../utils/httpErrors.js';

// GET all restaurants & menus (Cached)
export const getDining = async (req, res) => {
  try {
    const cacheKey = 'rt:dining';
    
    // 1. Try reading cache
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      const data = req.user?.role === 'admin' ? cachedData : cachedData.map((restaurant) => ({
        ...restaurant,
        tables: (restaurant.tables || []).map((table) => ({ ...table, bookedSlots: [] }))
      }));
      return res.status(200).json({ source: 'Redis Cache', data });
    }

    // 2. Query MongoDB
    const restaurants = await Restaurant.find({});
    
    // 3. Save cache
    await cacheSet(cacheKey, restaurants, 3600);

    const data = req.user?.role === 'admin' ? restaurants : restaurants.map((restaurant) => ({
      ...restaurant.toObject(),
      tables: restaurant.tables.map((table) => ({ ...table.toObject(), bookedSlots: [] }))
    }));
    return res.status(200).json({ source: 'MongoDB Database', data });
  } catch (error) {
    return sendServerError(res, 'Error loading restaurants data.', error);
  }
};

// POST reserve a dining table -> Clear Redis cache
export const reserveTable = async (req, res) => {
  try {
    const { restaurantId, tableId, date, time, partySize } = req.body;

    if (!restaurantId || !tableId || !date || !time || !Number.isInteger(Number(partySize)) || Number(partySize) < 1) {
      return res.status(400).json({ message: 'Missing table booking details.' });
    }
    const reservationDate = new Date(`${date}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(reservationDate.getTime()) || reservationDate.toISOString().slice(0, 10) !== date || date < new Date().toISOString().slice(0, 10)) {
      return res.status(400).json({ message: 'Choose a valid reservation date that is today or later.' });
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      return res.status(400).json({ message: 'Choose a valid reservation time.' });
    }

    const rest = await Restaurant.findById(restaurantId);
    if (!rest) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    // Check if table exists
    const tableIndex = rest.tables.findIndex(t => t.id === parseInt(tableId));
    if (tableIndex === -1) {
      return res.status(404).json({ message: 'Table not found in restaurant.' });
    }

    const table = rest.tables[tableIndex];

    if (partySize > table.size) {
      return res.status(400).json({ message: `Party size exceeds table limit of ${table.size} guests.` });
    }

    if (isDiningSlotTaken(table.bookedSlots, date, time)) {
      return res.status(409).json({ message: 'This table is already reserved for the selected time.' });
    }

    const slot = {
      date,
      time,
      guestName: req.user.name,
      userId: req.user._id,
      partySize: parseInt(partySize)
    };
    const result = await Restaurant.updateOne({
      _id: rest._id,
      tables: { $elemMatch: {
        id: parseInt(tableId),
        size: { $gte: Number(partySize) },
        bookedSlots: { $not: { $elemMatch: { date, time } } }
      } }
    }, { $push: { 'tables.$.bookedSlots': slot } });
    if (!result.modifiedCount) {
      return res.status(409).json({ message: 'This table was just reserved for the selected time. Please choose another slot.' });
    }

    // Invalidate Redis dining cache
    await cacheFlush('rt:dining');

    return res.status(201).json({
      message: 'Gourmet dining table reserved successfully!',
      restaurant: { id: rest._id, name: rest.name }
    });
  } catch (error) {
    return sendServerError(res, 'Error reserving table.', error);
  }
};

// GET all reservations tracker (Admin summary)
export const getDiningReservations = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    let reservationsList = [];

    restaurants.forEach(rest => {
      rest.tables.forEach(table => {
        table.bookedSlots.forEach(slot => {
          reservationsList.push({
            restaurantId: rest._id,
            restaurantName: rest.name,
            tableId: table.id,
            tableLabel: table.label,
            date: slot.date,
            time: slot.time,
            guestName: slot.guestName,
            partySize: slot.partySize,
            id: slot._id
          });
        });
      });
    });

    return res.status(200).json({ reservations: reservationsList });
  } catch (error) {
    return sendServerError(res, 'Error gathering reservations list.', error);
  }
};

export const getMyDiningReservations = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ 'tables.bookedSlots.userId': req.user._id });
    const reservations = [];
    restaurants.forEach((restaurant) => restaurant.tables.forEach((table) => table.bookedSlots.forEach((slot) => {
      if (String(slot.userId) === String(req.user._id)) {
        reservations.push({
          id: slot._id,
          restaurantName: restaurant.name,
          tableLabel: table.label,
          date: slot.date,
          time: slot.time,
          partySize: slot.partySize
        });
      }
    })));
    return res.json({ reservations });
  } catch (error) {
    return sendServerError(res, 'Could not load your dining reservations.', error);
  }
};

export const cancelDiningReservation = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.reservationId)) {
    return res.status(400).json({ message: 'Invalid reservation identifier.' });
  }
  try {
    const slotFilter = { _id: req.params.reservationId };
    if (req.user.role !== 'admin') slotFilter.userId = req.user._id;
    const filter = { tables: { $elemMatch: { bookedSlots: { $elemMatch: slotFilter } } } };
    const result = await Restaurant.updateOne(filter, {
      $pull: { 'tables.$[].bookedSlots': { _id: req.params.reservationId } }
    });
    if (!result.modifiedCount) return res.status(404).json({ message: 'Dining reservation not found.' });
    await cacheFlush('rt:dining');
    return res.json({ message: 'Dining reservation cancelled.' });
  } catch (error) {
    return sendServerError(res, 'Could not cancel this dining reservation.', error);
  }
};
