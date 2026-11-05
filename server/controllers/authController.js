import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { createAccessToken } from '../middleware/auth.js';
import { validateGuestAccess, validateLogin } from '../utils/authRules.js';

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  username: user.username || null,
  roomNumber: user.roomNumber ?? null,
  email: user.email || null,
  role: user.role
});

export const guestAccess = async (req, res) => {
  try {
    const validation = validateGuestAccess(req.body);
    if (validation.error) return res.status(400).json({ message: validation.error });
    const { username, roomNumber } = validation.value;

    let user = await User.findOne({ username: username.toLowerCase(), role: 'guest' });
    if (!user) {
      user = await User.create({
        name: username,
        username,
        roomNumber,
        role: 'guest'
      });
    } else {
      user.name = username;
      user.roomNumber = roomNumber;
      await user.save();
    }

    return res.json({ user: publicUser(user), token: createAccessToken(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'That name is already in use. Add your surname to keep accounts distinct.' });
    }
    return res.status(500).json({ message: 'Could not open your guest account.' });
  }
};

export const login = async (req, res) => {
  const validation = validateLogin(req.body);
  if (validation.error) return res.status(401).json({ message: validation.error });
  const { email, password } = validation.value;
  const user = await User.findOne({ email, role: 'admin' }).select('+passwordHash');

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }

  return res.json({ user: publicUser(user), token: createAccessToken(user) });
};

export const currentUser = (req, res) => res.json({ user: publicUser(req.user) });
