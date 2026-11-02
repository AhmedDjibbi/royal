import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Clock3, MapPin, RefreshCw, TicketCheck, XCircle } from 'lucide-react';
import api from '../../services/api.js';

const MyStay = () => {
  const [bookings, setBookings] = useState([]);
  const [dining, setDining] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingData, diningData, claimData] = await Promise.all([
        api.getBookings(), api.getMyDiningReservations(), api.getReclamations()
      ]);
      setBookings(bookingData.bookings || []);
      setDining(diningData.reservations || []);
      setClaims(claimData.reclamations || []);
    } catch (requestError) {
      setError(requestError.message || 'Could not load your guest account.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(refresh); }, [refresh]);

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this room reservation?')) return;
    try { await api.cancelBooking(id); await refresh(); }
    catch (requestError) { setError(requestError.message); }
  };

  const cancelDining = async (id) => {
    if (!window.confirm('Cancel this dining reservation?')) return;
    try { await api.cancelDiningReservation(id); await refresh(); }
    catch (requestError) { setError(requestError.message); }
  };

  return (
    <div className="account-page">
      <header className="account-heading">
        <div><span className="intro-overline">YOUR GUEST PORTAL</span><h1>My <em>stay.</em></h1><p>Your reservations and guest-care requests, together in one place.</p></div>
        <button type="button" className="account-refresh" onClick={refresh} disabled={loading}><RefreshCw size={15} /> Refresh</button>
      </header>
      {error && <div role="alert" className="account-error">{error}</div>}
      {loading ? <div className="account-empty">Gathering your stay details…</div> : (
        <div className="account-grid">
          <section className="account-section">
            <div className="account-section-title"><CalendarDays size={18} /><div><span>ACCOMMODATION</span><h2>Room reservations</h2></div></div>
            {!bookings.length ? <div className="account-empty">No room reservations yet.</div> : bookings.map((booking) => (
              <article className="account-card" key={booking._id}>
                <div className="account-card-top"><div><span className={`account-status ${booking.status === 'Cancelled' ? 'cancelled' : ''}`}>{booking.status || 'Confirmed'}</span><h3>{booking.roomId?.name || 'Royal Talassa room'}</h3></div><strong>${booking.totalAmount}</strong></div>
                <div className="account-details"><span><CalendarDays size={14} />{new Date(booking.checkIn).toLocaleDateString()} – {new Date(booking.checkOut).toLocaleDateString()}</span><span><TicketCheck size={14} />{booking.guestsCount} guest{booking.guestsCount === 1 ? '' : 's'}</span></div>
                {booking.status !== 'Cancelled' && <button className="account-cancel" type="button" onClick={() => cancelBooking(booking._id)}><XCircle size={14} /> Cancel reservation</button>}
              </article>
            ))}
          </section>
          <section className="account-section">
            <div className="account-section-title"><Clock3 size={18} /><div><span>AT THE TABLE</span><h2>Dining reservations</h2></div></div>
            {!dining.length ? <div className="account-empty">No dining reservations yet.</div> : dining.map((reservation) => (
              <article className="account-card" key={reservation.id}>
                <div className="account-card-top"><div><span className="account-status">Reserved</span><h3>{reservation.restaurantName}</h3></div><strong>{reservation.partySize} covers</strong></div>
                <div className="account-details"><span><MapPin size={14} />{reservation.tableLabel}</span><span><CalendarDays size={14} />{reservation.date} · {reservation.time}</span></div>
                <button className="account-cancel" type="button" onClick={() => cancelDining(reservation.id)}><XCircle size={14} /> Cancel reservation</button>
              </article>
            ))}
          </section>
          <section className="account-section account-claims">
            <div className="account-section-title"><TicketCheck size={18} /><div><span>GUEST CARE</span><h2>Service requests</h2></div></div>
            {!claims.length ? <div className="account-empty">No service requests filed.</div> : claims.map((claim) => (
              <article className="account-card" key={claim._id}>
                <div className="account-card-top"><div><span className="account-status">{claim.status}</span><h3>{claim.category} · {claim.urgency} priority</h3></div></div>
                <p className="account-claim-description">{claim.description}</p>
                {claim.response && <p className="account-response"><strong>Hotel response:</strong> {claim.response}</p>}
              </article>
            ))}
          </section>
        </div>
      )}
    </div>
  );
};

export default MyStay;
