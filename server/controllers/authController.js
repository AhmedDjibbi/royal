import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { createAccessToken } from '../middleware/auth.js';
import { validateLogin, validateRegistration } from '../utils/authRules.js';

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
});

export const register = async (req, res) => {
  try {
    const validation = validateRegistration(req.body);
    if (validation.error) return res.status(400).json({ message: validation.error });
    const { name, email, password } = validation.value;

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role: 'guest' });
    return res.status(201).json({ user: publicUser(user), token: createAccessToken(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
    return res.status(500).json({ message: 'Could not create your account.' });
  }
};

export const login = async (req, res) => {
  const validation = validateLogin(req.body);
  if (validation.error) return res.status(401).json({ message: validation.error });
  const { email, password } = validation.value;
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }

  return res.json({ user: publicUser(user), token: createAccessToken(user) });
};

export const currentUser = (req, res) => res.json({ user: publicUser(req.user) });
