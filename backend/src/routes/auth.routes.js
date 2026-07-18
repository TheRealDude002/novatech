import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  register,
  login,
  me,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  removeAddress,
} from '../controllers/auth.controller.js';

import express from 'express';
const router = express.Router();

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Tell us your full name (2 to 80 characters).'),
  body('email').isEmail().withMessage('That email does not look right.'),
  body('password').isLength({ min: 6 }).withMessage('Use at least 6 characters for your password.'),
  body('phone').optional().isMobilePhone('any').withMessage('Phone number is not valid.'),
];

const loginRules = [
  body('email').isEmail().withMessage('Enter the email you signed up with.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, me);
router.put('/me', protect, updateProfile);
router.put('/me/password', protect, changePassword);
router.post('/me/addresses', protect, addAddress);
router.put('/me/addresses/:id', protect, updateAddress);
router.delete('/me/addresses/:id', protect, removeAddress);

export default router;
