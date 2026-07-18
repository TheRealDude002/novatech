import User from '../models/User.js';
import { signToken } from '../utils/helpers.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }
    const user = await User.create({ name, email, password, phone });
    const token = signToken(user._id);
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });
    res.status(201).json({
      message: `Welcome aboard, ${user.name.split(' ')[0]}.`,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    console.log("Searching for:", email);
console.log("Found user:", user);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact support.' });
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const token = signToken(user._id);
    res.json({
      message: `Welcome back, ${user.name.split(' ')[0]}.`,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
};

export const me = (req, res) => {
  res.json({ user: req.user });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save({ validateBeforeSave: false });
    res.json({ message: 'Profile updated.', user });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Your current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed. Use the new one next time you sign in.' });
  } catch (err) {
    next(err);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ message: 'Address saved.', addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ message: 'Address not found.' });
    Object.assign(addr, req.body);
    if (req.body.isDefault) {
      user.addresses.forEach((a) => {
        if (a._id.toString() !== req.params.id) a.isDefault = false;
      });
    }
    await user.save();
    res.json({ message: 'Address updated.', addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

export const removeAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.id(req.params.id).deleteOne();
    await user.save();
    res.json({ message: 'Address removed.', addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};
