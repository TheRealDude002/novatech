import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import { getAllUsers, getUser, toggleUserActive, updateRole } from '../controllers/user.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', admin, getAllUsers);
router.get('/:id', admin, getUser);
router.put('/:id/active', admin, toggleUserActive);
router.put('/:id/role', admin, updateRole);

export default router;
