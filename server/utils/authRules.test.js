import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createAccessToken, requireAdmin, requireAuth } from '../middleware/auth.js';
import { normalizeEmail, validateLogin, validateRegistration } from './authRules.js';

const testSecret = 'auth-test-secret-that-is-long-enough-to-sign';

 test('registration trims values and normalizes email', () => {
  assert.deepEqual(validateRegistration({ name: '  Guest Name ', email: ' GUEST@Example.com ', password: 'secure-password' }), {
    value: { name: 'Guest Name', email: 'guest@example.com', password: 'secure-password' }
  });
});

test('registration enforces name, email, and bcrypt password byte limits', () => {
  assert.match(validateRegistration({ name: 'A', email: 'guest@example.com', password: 'secure-password' }).error, /Name/);
  assert.match(validateRegistration({ name: 'Guest', email: 'not-an-email', password: 'secure-password' }).error, /email/i);
  assert.match(validateRegistration({ name: 'Guest', email: 'guest@example.com', password: 'short' }).error, /Password/);
  assert.match(validateRegistration({ name: 'Guest', email: 'guest@example.com', password: 'x'.repeat(73) }).error, /Password/);
  assert.match(validateRegistration({ name: 'Guest', email: 'guest@example.com', password: 'é'.repeat(37) }).error, /UTF-8 bytes/);
});

test('login rejects malformed credentials with a generic message', () => {
  assert.equal(validateLogin({ email: 'bad', password: 'secret' }).error, 'Email or password is incorrect.');
  assert.deepEqual(validateLogin({ email: ' GUEST@Example.com ', password: 'secret' }), {
    value: { email: 'guest@example.com', password: 'secret' }
  });
  assert.equal(normalizeEmail(null), '');
});

test('signed session token carries server-issued user identity and role', () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = testSecret;
  try {
    const token = createAccessToken({ id: '507f1f77bcf86cd799439011', role: 'guest' });
    const claims = jwt.verify(token, testSecret, { issuer: 'royal-talassa-api', audience: 'royal-talassa-client' });
    assert.equal(claims.sub, '507f1f77bcf86cd799439011');
    assert.equal(claims.role, 'guest');
    assert.ok(claims.exp > claims.iat);
  } finally {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test('authentication middleware rejects a missing bearer token', async () => {
  const response = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
  let continued = false;
  await requireAuth({ get: () => undefined }, response, () => { continued = true; });
  assert.equal(response.statusCode, 401);
  assert.equal(continued, false);
});

test('administrator gate rejects guests and allows administrator identities', () => {
  const response = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
  let continued = false;
  requireAdmin({ user: { role: 'guest' } }, response, () => { continued = true; });
  assert.equal(response.statusCode, 403);
  assert.equal(continued, false);

  response.statusCode = 200;
  requireAdmin({ user: { role: 'admin' } }, response, () => { continued = true; });
  assert.equal(continued, true);
});
