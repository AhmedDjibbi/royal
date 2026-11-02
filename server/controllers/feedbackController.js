import Review from '../models/Review.js';
import Reclamation from '../models/Reclamation.js';
import { cacheGet, cacheSet, cacheFlush } from '../config/redis.js';
import { sendServerError } from '../utils/httpErrors.js';

// GET all approved reviews (Cached)
export const getReviews = async (req, res) => {
  try {
    const cacheKey = 'rt:reviews';

    // 1. Try reading cache
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return res.status(200).json({ source: 'Redis Cache', data: cachedData });
    }

    // 2. Query MongoDB for approved reviews
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 });

    // 3. Save queried data to Redis Cache
    await cacheSet(cacheKey, reviews, 3600);

    return res.status(200).json({ source: 'MongoDB Database', data: reviews });
  } catch (error) {
    return sendServerError(res, 'Error loading reviews.', error);
  }
};

// POST add new review -> Clear Cache
export const addReview = async (req, res) => {
  try {
    const { rating, category, comment } = req.body;

    if (!rating || !category || !comment) {
      return res.status(400).json({ message: 'Missing feedback parameters.' });
    }
    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5
      || !['Overall', 'Service', 'Dining', 'Rooms'].includes(category)
      || String(comment).trim().length > 2000) {
      return res.status(400).json({ message: 'Review rating, category, or comment is invalid.' });
    }

    const newReview = new Review({
      guestName: req.user.name,
      rating: parseInt(rating),
      category,
      comment,
      approved: true // Auto-approved for seamless demo
    });

    await newReview.save();

    // Invalidate reviews cache
    await cacheFlush('rt:reviews');

    return res.status(201).json({
      message: 'Review posted successfully. Thank you for your feedback!',
      review: newReview
    });
  } catch (error) {
    return sendServerError(res, 'Error adding review.', error);
  }
};

// GET all reclamations (Private to user or admin dashboard, no cache)
export const getReclamations = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const reclamations = await Reclamation.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ reclamations });
  } catch (error) {
    return sendServerError(res, 'Error loading complaint tickets.', error);
  }
};

// POST lodge new reclamation
export const addReclamation = async (req, res) => {
  try {
    const { roomNumber, category, urgency, description } = req.body;

    if (!roomNumber || !category || !urgency || !description) {
      return res.status(400).json({ message: 'Missing complaint ticket parameters.' });
    }
    if (!['Maintenance', 'Housekeeping', 'Rooms', 'Dining', 'Other'].includes(category)
      || !['Low', 'Medium', 'High'].includes(urgency)
      || String(description).trim().length < 5 || String(description).trim().length > 2000) {
      return res.status(400).json({ message: 'Service request details are invalid.' });
    }

    const newTicket = new Reclamation({
      guestName: req.user.name,
      userId: req.user._id,
      roomNumber: req.user.roomNumber || roomNumber || 'Guest',
      category,
      urgency,
      description
    });

    await newTicket.save();

    return res.status(201).json({
      message: 'Complaint logged successfully. The hotel administration will respond shortly.',
      ticket: newTicket
    });
  } catch (error) {
    return sendServerError(res, 'Error lodging complaint.', error);
  }
};

// PUT resolve reclamation ticket (Admin)
export const resolveReclamation = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'A processing status is required.' });
    }
    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Processing status is invalid.' });
    }

    const ticket = await Reclamation.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Complaint ticket not found.' });
    }

    ticket.status = status;
    if (response !== undefined) {
      ticket.response = response;
    }

    await ticket.save();

    return res.status(200).json({
      message: 'Complaint ticket status adjusted successfully.',
      ticket
    });
  } catch (error) {
    return sendServerError(res, 'Error updating complaint ticket.', error);
  }
};
