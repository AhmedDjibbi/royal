export const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase();

export const validateGuestAccess = ({ username: rawUsername, roomNumber: rawRoomNumber } = {}) => {
  const username = String(rawUsername ?? '').trim().replace(/\s+/g, ' ');
  const roomNumber = Number(rawRoomNumber);

  if (username.length < 2 || username.length > 100) return { error: 'Enter your name between 2 and 100 characters.' };
  if (!Number.isInteger(roomNumber) || roomNumber < 101 || roomNumber > 483) {
    return { error: 'Room number must be between 101 and 483.' };
  }
  return { value: { username, roomNumber } };
};

export const validateLogin = ({ email: rawEmail, password: rawPassword } = {}) => {
  const email = normalizeEmail(rawEmail);
  const password = String(rawPassword ?? '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !password || password.length > 72) {
    return { error: 'Email or password is incorrect.' };
  }
  return { value: { email, password } };
};
