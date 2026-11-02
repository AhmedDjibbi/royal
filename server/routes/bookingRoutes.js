import express from 'express';
import { cancelBooking, createBooking, getBookings } from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getBookings);
router.post('/', requireAuth, createBooking);
router.patch('/:id/cancel', requireAuth, cancelBooking);

export default router;
