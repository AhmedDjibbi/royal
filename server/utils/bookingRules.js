export const parseStayDates = (checkIn, checkOut, today = new Date()) => {
  const validDay = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  };

  if (!validDay(checkIn) || !validDay(checkOut)) return { error: 'Please provide valid check-in and check-out dates.' };
  if (checkOut <= checkIn) return { error: 'Check-out must be after check-in.' };
  if (checkIn < today.toISOString().slice(0, 10)) return { error: 'Check-in cannot be in the past.' };

  const start = new Date(`${checkIn}T00:00:00.000Z`);
  const end = new Date(`${checkOut}T00:00:00.000Z`);
  return { start, end, nights: Math.round((end - start) / 86_400_000) };
};

export const calculateStayTotal = (roomPrice, nights, addons, rates) => roomPrice * nights
  + addons.reduce((sum, addon) => {
    const rate = rates[addon];
    return sum + rate.price * (rate.perNight ? nights : 1);
  }, 0);

export const buildNightKeys = (start, nights) => Array.from({ length: nights }, (_, index) => {
  const date = new Date(start);
  date.setUTCDate(date.getUTCDate() + index);
  return date.toISOString().slice(0, 10);
});

export const stayRangesOverlap = (firstStart, firstEnd, secondStart, secondEnd) => (
  new Date(firstStart) < new Date(secondEnd) && new Date(firstEnd) > new Date(secondStart)
);

export const isDiningSlotTaken = (bookedSlots, date, time) => bookedSlots.some(
  (slot) => slot.date === date && slot.time === time
);

export const hasEventCapacity = (registeredCount, capacity) => registeredCount < capacity;
