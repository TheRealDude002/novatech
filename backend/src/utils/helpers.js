import jwt from 'jsonwebtoken';

export const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret-change-me', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const formatNaira = (n) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

export const paginate = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(query.limit, 10) || 12));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
