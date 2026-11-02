import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNightKeys, calculateStayTotal, hasEventCapacity, isDiningSlotTaken, parseStayDates, stayRangesOverlap } from './bookingRules.js';

const today = new Date('2026-11-02T12:00:00.000Z');

test('stay dates use checkout-exclusive UTC nights', () => {
  const stay = parseStayDates('2026-11-02', '2026-11-05', today);
  assert.equal(stay.nights, 3);
  assert.deepEqual(buildNightKeys(stay.start, stay.nights), ['2026-11-02', '2026-11-03', '2026-11-04']);
});

test('stay dates reject invalid days, past check-ins, and zero-night stays', () => {
  assert.match(parseStayDates('2026-02-30', '2026-03-02', today).error, /valid/);
  assert.match(parseStayDates('2026-11-01', '2026-11-03', today).error, /past/);
  assert.match(parseStayDates('2026-11-03', '2026-11-03', today).error, /after/);
});

test('stay total includes per-night and flat add-ons', () => {
  const total = calculateStayTotal(250, 3, ['butler', 'spa', 'airport'], {
    butler: { price: 100, perNight: true },
    spa: { price: 50, perNight: true },
    airport: { price: 80, perNight: false }
  });
  assert.equal(total, 1280);
});

test('room stay collisions treat checkout as an exclusive date', () => {
  assert.equal(stayRangesOverlap('2026-11-02', '2026-11-05', '2026-11-04', '2026-11-06'), true);
  assert.equal(stayRangesOverlap('2026-11-02', '2026-11-05', '2026-11-05', '2026-11-08'), false);
  assert.equal(stayRangesOverlap('2026-11-02', '2026-11-05', '2026-11-01', '2026-11-02'), false);
});

test('dining slots conflict only for matching date and time', () => {
  const slots = [{ date: '2026-11-04', time: '19:00' }];
  assert.equal(isDiningSlotTaken(slots, '2026-11-04', '19:00'), true);
  assert.equal(isDiningSlotTaken(slots, '2026-11-04', '20:00'), false);
});

test('event capacity cannot exceed the published maximum', () => {
  assert.equal(hasEventCapacity(19, 20), true);
  assert.equal(hasEventCapacity(20, 20), false);
});
