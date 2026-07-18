import User from '../models/User.js';
import Order from '../models/Order.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.q) {
      const rx = new RegExp(req.query.q, 'i');
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({ users, page, pages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('orderNumber total status createdAt');
    res.json({ user, orders });
  } catch (err) {
    next(err);
  }
};

export const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({
      message: `Account ${user.isActive ? 'activated' : 'deactivated'}.`,
      isActive: user.isActive,
    });
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.role = req.body.role;
    await user.save();
    res.json({ message: 'Role updated.', role: user.role });
  } catch (err) {
    next(err);
  }
};
