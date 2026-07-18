import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from '../controllers/cart.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', getCart);
router.post('/:id', addToCart);
router.put('/:id', updateQuantity);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

export default router;
