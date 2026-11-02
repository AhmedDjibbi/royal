import express from 'express';
import { getRooms, checkRoomAvailability, updateRoomPrice, toggleRoomAvailability } from '../controllers/roomController.js';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getRooms);
router.post('/check', checkRoomAvailability);
router.put('/price/:id', requireAuth, requireAdmin, updateRoomPrice);
router.put('/availability/:id', requireAuth, requireAdmin, toggleRoomAvailability);

export default router;
