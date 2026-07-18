import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware.js';
import {
  getProductReviews,
  createReview,
  markHelpful,
  deleteReview,
} from '../controllers/review.controller.js';

const router = express.Router();

router.get('/:productId', getProductReviews);
router.post('/:productId', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Pick a rating between 1 and 5.'),
  body('comment').trim().isLength({ min: 10, max: 1000 }).withMessage('Tell us a bit more (10–1000 characters).'),
], validate, createReview);
router.post('/:id/helpful', markHelpful);
router.delete('/:id', protect, deleteReview);

export default router;
