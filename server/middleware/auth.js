import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production.');
  }
  return secret || 'local-development-secret-change-before-deploy-please';
};

export const createAccessToken = (user) => jwt.sign(
  { sub: user.id, role: user.role },
  getSecret(),
  { expiresIn: '12h', issuer: 'royal-talassa-api', audience: 'royal-talassa-client' }
);

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });

    const payload = jwt.verify(token, getSecret(), {
      issuer: 'royal-talassa-api',
      audience: 'royal-talassa-client'
    });
    const user = await User.findById(payload.sub).select('_id name username roomNumber email role');
    if (!user) return res.status(401).json({ message: 'Your session is no longer valid. Please sign in again.' });

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    }
    return next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  if (!req.get('authorization')) return next();
  return requireAuth(req, res, next);
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Administrator access is required.' });
  }
  return next();
};
