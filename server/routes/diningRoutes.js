import express from 'express';
import { cancelDiningReservation, getDining, getDiningReservations, getMyDiningReservations, reserveTable } from '../controllers/diningController.js';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getDining);
router.post('/reserve', requireAuth, reserveTable);
router.get('/my-reservations', requireAuth, getMyDiningReservations);
router.delete('/reservations/:reservationId', requireAuth, cancelDiningReservation);
router.get('/reservations', requireAuth, requireAdmin, getDiningReservations);

export default router;
