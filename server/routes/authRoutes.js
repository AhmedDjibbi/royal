import express from 'express';
import { currentUser, guestAccess, login } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.post('/guest', guestAccess);
router.post('/login', login);
router.get('/me', requireAuth, currentUser);

export default router;
