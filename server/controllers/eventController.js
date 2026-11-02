import Event from '../models/Event.js';
import { cacheGet, cacheSet, cacheFlush } from '../config/redis.js';
import { hasEventCapacity } from '../utils/bookingRules.js';
import { sendServerError } from '../utils/httpErrors.js';

const presentEvents = (events, user) => events.map((event) => {
  const data = event.toObject ? event.toObject() : { ...event };
  const registeredCount = Math.max(data.registered?.length || 0, data.registrations?.length || 0);
  data.isRegistered = Boolean(user && (
    data.registrations?.some((registration) => String(registration.userId) === String(user._id))
    || (!data.registrations?.length && data.registered?.includes(user.name))
  ));
  data.registeredCount = registeredCount;
  if (user?.role !== 'admin') {
    data.registered = [];
    delete data.registrations;
  }
  return data;
});

// GET all events & activities (Cached)
export const getEvents = async (req, res) => {
  try {
    const cacheKey = 'rt:events';

    // 1. Try reading cache
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return res.status(200).json({ source: 'Redis Cache', data: presentEvents(cachedData, req.user) });
    }

    // 2. Query MongoDB
    const events = await Event.find({}).sort({ date: 1 });

    // 3. Save to Redis
    await cacheSet(cacheKey, events, 3600);

    return res.status(200).json({ source: 'MongoDB Database', data: presentEvents(events, req.user) });
  } catch (error) {
    return sendServerError(res, 'Error retrieving events calendar.', error);
  }
};

// POST register for event/activity -> Clear Cache
export const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event or activity not found.' });
    }

    const registeredByAccount = event.registrations.some((registration) => String(registration.userId) === String(req.user._id));
    const legacyNameMatch = !event.registrations.length && event.registered.includes(req.user.name);
    if (registeredByAccount || legacyNameMatch) {
      return res.status(400).json({ message: 'Guest is already registered for this event.' });
    }
    if (!hasEventCapacity(Math.max(event.registered.length, event.registrations.length), event.capacity)) {
      return res.status(409).json({ message: 'This event has reached its maximum capacity limit.' });
    }

    const update = await Event.updateOne({
      _id: id,
      'registrations.userId': { $ne: req.user._id },
      $expr: { $lt: [
        { $max: [
          { $size: { $ifNull: ['$registered', []] } },
          { $size: { $ifNull: ['$registrations', []] } }
        ] },
        '$capacity'
      ] }
    }, {
      $addToSet: { registered: req.user.name },
      $push: { registrations: { userId: req.user._id, guestName: req.user.name } }
    });
    if (!update.modifiedCount) {
      const current = await Event.findById(id);
      if (current?.registrations.some((registration) => String(registration.userId) === String(req.user._id))) {
        return res.status(409).json({ message: 'Guest is already registered for this event.' });
      }
      return res.status(409).json({ message: 'This event has reached its maximum capacity limit.' });
    }

    // Flush Cache to force refresh on details
    await cacheFlush('rt:events');

    return res.status(200).json({
      message: `Successfully registered for ${event.name}!`,
      event: await Event.findById(id)
    });
  } catch (error) {
    return sendServerError(res, 'Error registering for event.', error);
  }
};

// POST add a new event (Admin) -> Invalidate Cache
export const createEvent = async (req, res) => {
  try {
    const { name, type, category, description, date, time, price, capacity, image } = req.body;

    if (!name || !type || !description || !date || !time || price === undefined || !capacity || !image) {
      return res.status(400).json({ message: 'Missing required event fields.' });
    }
    const eventDate = new Date(`${date}T00:00:00.000Z`);
    if (String(name).trim().length > 100 || !['Event', 'Activity'].includes(type)
      || String(description).trim().length < 10 || String(description).trim().length > 800
      || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(eventDate.getTime())
      || eventDate.toISOString().slice(0, 10) !== date || date < new Date().toISOString().slice(0, 10)
      || !Number.isFinite(Number(price)) || Number(price) < 0
      || !Number.isInteger(Number(capacity)) || Number(capacity) < 1 || Number(capacity) > 1000
      || !/^\/images\/[\w.-]+\.(jpg|jpeg|png|webp)$/i.test(image)) {
      return res.status(400).json({ message: 'Event details are invalid.' });
    }

    const freshEvent = new Event({
      name,
      type,
      category: category || 'General',
      description,
      date,
      time,
      price: parseFloat(price),
      capacity: parseInt(capacity),
      image,
      registered: []
    });

    await freshEvent.save();

    // Invalidate Redis cache
    await cacheFlush('rt:events');

    return res.status(201).json({
      message: 'Luxury event scheduled and published successfully!',
      event: freshEvent
    });
  } catch (error) {
    return sendServerError(res, 'Error scheduling event.', error);
  }
};
