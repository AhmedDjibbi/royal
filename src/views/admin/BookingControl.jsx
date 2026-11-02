import { useMemo, useState } from 'react';
import { CalendarDays, Search, XCircle } from 'lucide-react';
import { useHotel } from '../../context/HotelContext.jsx';
import api from '../../services/api.js';

const BookingControl = () => {
  const { rooms, refresh } = useHotel();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [message, setMessage] = useState('');
  const bookings = useMemo(() => rooms.flatMap((room) => (room.bookings || []).map((booking) => ({ ...booking, roomName: room.name })))
    .filter((booking) => filter === 'All' || (booking.status || 'Confirmed') === filter)
    .filter((booking) => `${booking.guestName} ${booking.roomName}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt || b.checkIn) - new Date(a.createdAt || a.checkIn)), [rooms, filter, query]);

  const cancel = async (booking) => {
    if (!window.confirm(`Cancel ${booking.guestName}'s reservation?`)) return;
    try { await api.cancelBooking(booking._id || booking.id); setMessage('Reservation cancelled.'); await refresh(); }
    catch (error) { setMessage(error.message || 'Could not cancel reservation.'); }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-heading"><div><span className="intro-overline">GUEST OPERATIONS</span><h1>Stay <em>reservations.</em></h1><p>Search upcoming stays, review reservation details, and manage cancellations.</p></div></header>
      <div className="booking-tools">
        <label className="booking-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search guest or room" aria-label="Search guest or room" /></label>
        <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter reservation status"><option>All</option><option>Confirmed</option><option>Cancelled</option></select>
      </div>
      {message && <p className="admin-feedback-message" role="status">{message}</p>}
      <div className="booking-table-wrap"><table className="booking-table"><thead><tr><th>Guest</th><th>Room</th><th>Stay dates</th><th>Guests</th><th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>
        {bookings.map((booking) => <tr key={booking._id || booking.id}>
          <td>{booking.guestName}</td><td>{booking.roomName}</td>
          <td><CalendarDays size={13} />{new Date(booking.checkIn).toLocaleDateString()} – {new Date(booking.checkOut).toLocaleDateString()}</td>
          <td>{booking.guestsCount || booking.guests}</td><td>${booking.totalAmount ?? booking.total}</td>
          <td><span className={`account-status ${(booking.status || 'Confirmed') === 'Cancelled' ? 'cancelled' : ''}`}>{booking.status || 'Confirmed'}</span></td>
          <td>{booking.status !== 'Cancelled' && <button className="account-cancel" type="button" onClick={() => cancel(booking)}><XCircle size={14} /> Cancel</button>}</td>
        </tr>)}
        {!bookings.length && <tr><td colSpan="7" className="booking-empty">No reservations match your search.</td></tr>}
      </tbody></table></div>
    </div>
  );
};

export default BookingControl;
