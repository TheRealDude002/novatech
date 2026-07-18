import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../controllers/wishlist.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/:id', addToWishlist);
router.delete('/:id', removeFromWishlist);
router.delete('/', clearWishlist);

export default router;
