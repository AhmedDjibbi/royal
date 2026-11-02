import express from 'express';
import { getEvents, registerForEvent, createEvent } from '../controllers/eventController.js';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getEvents);
router.post('/register/:id', requireAuth, registerForEvent);
router.post('/', requireAuth, requireAdmin, createEvent);

export default router;
