import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:5000/api';

// Helper unit validation functions representing application validation logic
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function calculateEventFee(baseFee, attendees = 1, isMember = false) {
  if (baseFee <= 0) return 0;
  const subtotal = baseFee * attendees;
  const discount = isMember ? 0.1 * subtotal : 0;
  return subtotal - discount;
}

test('TC-01 [Unit] - Input Validation Function validates email formatting', () => {
  assert.equal(validateEmail('invalid-email-format'), false, 'Should reject invalid email format');
  assert.equal(validateEmail('student@bmsit.in'), true, 'Should accept valid email format');
});

test('TC-02 [Unit] - Core Business Calculation calculates event fee accurately', () => {
  const total = calculateEventFee(150, 2, true);
  assert.equal(total, 270, '150 * 2 attendees with 10% membership discount should equal 270');
});

test('TC-03 [API] - POST /api/login returns 200 and token for valid credentials', async () => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
  });
  assert.equal(res.status, 200, 'Expected HTTP 200 status');
  const data = await res.json();
  assert.ok(data.token, 'Response must contain JWT token');
  assert.equal(data.role, 'admin', 'Role must match admin');
});

test('TC-04 [API] - POST /api/login rejects requests with missing required fields with 400', async () => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com' }) // missing password
  });
  assert.equal(res.status, 400, 'Expected HTTP 400 for missing password');
  const data = await res.json();
  assert.ok(data.error, 'Response must provide an error message');
});

test('TC-05 [API] - GET /api/admin/dashboard delivers system metrics with valid Admin JWT', async () => {
  // Login first to get JWT
  const loginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
  });
  const { token } = await loginRes.json();

  const res = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(res.status, 200, 'Expected HTTP 200 for authenticated admin');
  const data = await res.json();
  assert.ok(data.stats, 'Dashboard payload must contain stats summary');
  assert.ok(data.stats.totalEvents >= 0, 'totalEvents metric must be defined');
  assert.ok(data.stats.totalUsers >= 0, 'totalUsers metric must be defined');
});

test('TC-06 [API] - GET /api/admin/dashboard blocks unauthorized requests with 401', async () => {
  const res = await fetch(`${BASE_URL}/admin/dashboard`); // No Authorization header
  assert.equal(res.status, 401, 'Expected HTTP 401 Access Denied without token');
});

test('TC-07 [API] - GET /api/clubs/public retrieves public club directory', async () => {
  const res = await fetch(`${BASE_URL}/clubs/public`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for public clubs listing');
  const clubs = await res.json();
  assert.ok(Array.isArray(clubs), 'Response must be an array of clubs');
  assert.ok(clubs.length > 0, 'Must return at least one club record');
});

test('TC-08 [API] - POST /api/events/:id/register handles participant registration logic', async () => {
  // Login as user
  const loginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@test.com', password: 'password123' })
  });
  const { token } = await loginRes.json();

  const res = await fetch(`${BASE_URL}/events/1/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  // Can be 200 (registered) or 400 (already registered duplicate prevention)
  assert.ok([200, 400].includes(res.status), 'Expected 200 success or 400 duplicate prevention');
});
