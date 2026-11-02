const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Fail-safe helper: logs API requests and handles standard fetch responses
const request = async (path, options = {}) => {
  const url = `${API_BASE}${path}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(sessionStorage.getItem('rt_token') ? { Authorization: `Bearer ${sessionStorage.getItem('rt_token')}` } : {}),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401 && !['/auth/login', '/auth/register'].includes(path)) {
        sessionStorage.removeItem('rt_token');
        window.dispatchEvent(new Event('rt:unauthorized'));
      }
      throw new Error(result.message || `HTTP error! Status: ${response.status}`);
    }
    return result;
  } catch (error) {
    console.error(`💥 API Service Error at "${path}":`, error.message);
    throw error;
  }
};

// Expose individual backend action calls
export const api = {
  // Accounts
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (details) => request('/auth/register', { method: 'POST', body: JSON.stringify(details) }),
  currentUser: () => request('/auth/me'),
  // Rooms
  getRooms: () => request('/rooms'),
  checkRoomAvailability: (roomId, checkIn, checkOut) => 
    request('/rooms/check', {
      method: 'POST',
      body: JSON.stringify({ roomId, checkIn, checkOut })
    }),
  updateRoomPrice: (id, price) => 
    request(`/rooms/price/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ price })
    }),
  toggleRoomAvailability: (id) => 
    request(`/rooms/availability/${id}`, {
      method: 'PUT'
    }),

  // Stays & Bookings
  createBooking: (bookingData) => 
    request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    }),
  getBookings: () => request('/bookings'),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),

  // Dining
  getDining: () => request('/dining'),
  reserveTable: (tableReservationData) => 
    request('/dining/reserve', {
      method: 'POST',
      body: JSON.stringify(tableReservationData)
    }),
  getDiningReservations: () => request('/dining/reservations'),
  getMyDiningReservations: () => request('/dining/my-reservations'),
  cancelDiningReservation: (id) => request(`/dining/reservations/${id}`, { method: 'DELETE' }),

  // Events & Activities
  getEvents: () => request('/events'),
  registerForEvent: (id) => 
    request(`/events/register/${id}`, {
      method: 'POST',
      body: JSON.stringify({})
    }),
  createEvent: (eventData) => 
    request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    }),

  // Reviews & Complaints
  getReviews: () => request('/feedback/reviews'),
  addReview: (reviewData) => 
    request('/feedback/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    }),
  getReclamations: () => request('/feedback/reclamations'),
  addReclamation: (complaintData) => 
    request('/feedback/reclamations', {
      method: 'POST',
      body: JSON.stringify(complaintData)
    }),
  resolveReclamation: (id, status, responseText) => 
    request(`/feedback/reclamations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, response: responseText })
    })
};

export default api;
