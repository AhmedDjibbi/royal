import express from 'express';
import { getReviews, addReview, getReclamations, addReclamation, resolveReclamation } from '../controllers/feedbackController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public Guest Reviews
router.get('/reviews', getReviews);
router.post('/reviews', requireAuth, addReview);

// Private Reclamations / Complaints
router.get('/reclamations', requireAuth, getReclamations);
router.post('/reclamations', requireAuth, addReclamation);
router.put('/reclamations/:id', requireAuth, requireAdmin, resolveReclamation);

export default router;
