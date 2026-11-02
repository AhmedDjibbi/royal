export const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase();

export const validateRegistration = ({ name: rawName, email: rawEmail, password: rawPassword } = {}) => {
  const name = String(rawName ?? '').trim();
  const email = normalizeEmail(rawEmail);
  const password = String(rawPassword ?? '');

  if (name.length < 2 || name.length > 100) return { error: 'Name must be between 2 and 100 characters.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { error: 'Enter a valid email address.' };
  if (password.length < 10 || Buffer.byteLength(password, 'utf8') > 72) return { error: 'Password must be at least 10 characters and no more than 72 UTF-8 bytes.' };
  return { value: { name, email, password } };
};

export const validateLogin = ({ email: rawEmail, password: rawPassword } = {}) => {
  const email = normalizeEmail(rawEmail);
  const password = String(rawPassword ?? '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !password || password.length > 72) {
    return { error: 'Email or password is incorrect.' };
  }
  return { value: { email, password } };
};
