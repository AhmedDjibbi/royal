import { useState } from 'react';
import { useHotel } from '../../context/HotelContext.jsx';
import { useUser } from '../../context/UserContext.jsx';
import { Clock, Calendar, Ticket, X } from 'lucide-react';

export const Dining = ({ onRequireAuth }) => {
  const { dining, bookTable, loading } = useHotel();
  const { user } = useUser();

  const [selectedRest, setSelectedRest] = useState(null);
  const [selectedTable, setSelectedTable] = useState('');
  const [reserveDate, setReserveDate] = useState('');
  const [reserveTime, setReserveTime] = useState('19:00');
  const [partySize, setPartySize] = useState(2);

  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [successTicket, setSuccessTicket] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenReservations = (restaurant) => {
    setSelectedRest(restaurant);
    if (restaurant.tables && restaurant.tables.length > 0) {
      setSelectedTable(restaurant.tables[0].id.toString());
    }
  };

  const handleTableReserve = async (e) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!selectedTable || !reserveDate || !reserveTime || !partySize) {
      setBookingError('Please complete all table reservation fields.');
      return;
    }

    const tableObj = selectedRest.tables.find(t => t.id === parseInt(selectedTable));
    if (!tableObj) {
      setBookingError('Selected table not found.');
      return;
    }

    if (parseInt(partySize) > tableObj.size) {
      setBookingError(`This table only accommodates up to ${tableObj.size} guests.`);
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      await bookTable(
        selectedRest._id || selectedRest.id,
        parseInt(selectedTable),
        reserveDate,
        reserveTime,
        user.name,
        parseInt(partySize)
      );

      setSuccessTicket({
        restaurantName: selectedRest.name,
        cuisine: selectedRest.cuisine,
        tableLabel: tableObj.label,
        date: reserveDate,
        time: reserveTime,
        partySize
      });
      setIsSuccessModal(true);
      resetForm();
    } catch (err) {
      setBookingError(err.message || 'This table is already reserved for this slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedRest(null);
    setSelectedTable('');
    setReserveDate('');
    setReserveTime('19:00');
    setPartySize(2);
    setBookingError('');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-20 text-center">
        <div className="text-brand text-lg font-serif">Loading gastronomy restaurants...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 animate-fade-in">
      <div className="text-center mb-16">
        <span className="text-brand text-xs tracking-[0.2em] uppercase font-semibold block mb-3">Gastronomy & Dining</span>
        <h2 className="text-4xl font-serif text-white mb-6">Signature Dining Terraces</h2>
        <p className="text-text-muted max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Explore the rich culinary heritage of Skanes Coast. Experience premium seafood catching at L'Agape terrace 
          or authentic Tunisian claypot cuisines inside our palace patio at Carthage Grill.
        </p>
      </div>

      {/* Grid of Restaurants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {dining.map(restaurant => (
          <div key={restaurant._id || restaurant.id} className="glass-card hover:glass-card-hover flex flex-col overflow-hidden p-0 border border-white/5">
            <div className="relative h-64 w-full">
              <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover border-b border-white/5" />
              <div className="absolute inset-0 bg-linear-to-t from-deep/40 to-transparent" />
            </div>
            
            <div className="p-6 md:p-8 flex flex-col grow justify-between">
              <div>
                <span className="text-brand text-xs tracking-wider font-semibold uppercase block mb-2">
                  {restaurant.cuisine}
                </span>
                <h3 className="text-2xl font-serif text-white mb-3">{restaurant.name}</h3>
                <p className="text-text-muted text-sm leading-relaxed mb-6">
                  {restaurant.description}
                </p>

                {/* Table availability ticker */}
                <div className="flex flex-col gap-2.5 mb-6 text-xs border-t border-white/5 pt-4">
                  <div className="flex justify-between text-text-rich font-medium">
                    <span>Table Configuration</span>
                    <span>Available Seats</span>
                  </div>
                  {(restaurant.tables || []).map(table => (
                    <div key={table.id} className="flex justify-between text-text-muted">
                      <span>{table.label}</span>
                      <span className="text-brand font-semibold">{table.size} Covers Max</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button 
                className="w-full py-3 bg-brand hover:bg-brand-hover text-[#0A0E17] font-semibold text-xs rounded-md shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-none"
                onClick={() => user ? handleOpenReservations(restaurant) : onRequireAuth()}
              >
                <Clock size={14} /> Book Dining Seating
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Table Booking Modal */}
      {selectedRest && (
        <div className="fixed inset-0 bg-deep/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={resetForm} 
              className="absolute top-4 right-4 bg-transparent border-none text-text-muted hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <span className="text-brand text-xs tracking-widest font-semibold uppercase block mb-2">Table Seating Organizer</span>
            <h3 className="text-2xl font-serif text-white mb-6">{selectedRest.name}</h3>

            <form onSubmit={handleTableReserve} className="space-y-5">
              {/* Date */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted font-medium flex items-center gap-1.5">
                  <Calendar size={12} className="text-brand" /> Reservation Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full bg-[#111A2E]/80 border border-white/10 rounded-md px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                  required
                  value={reserveDate}
                  onChange={(e) => setReserveDate(e.target.value)}
                />
              </div>

              {/* Table Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted font-medium">Select Seating View</label>
                <select
                  className="w-full bg-[#111A2E]/80 border border-white/10 rounded-md px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                >
                  {(selectedRest.tables || []).map(table => (
                    <option key={table.id} value={table.id} className="bg-deep text-white">
                      {table.label} (Up to {table.size} guests)
                    </option>
                  ))}
                </select>
              </div>

              {/* Sessions & covers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-text-muted font-medium">Preferred Session Slot</label>
                  <select
                    className="w-full bg-[#111A2E]/80 border border-white/10 rounded-md px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                    value={reserveTime}
                    onChange={(e) => setReserveTime(e.target.value)}
                  >
                    <option value="19:00" className="bg-deep text-white">19:00 (Sunset View)</option>
                    <option value="19:30" className="bg-deep text-white">19:30 (Sunset View)</option>
                    <option value="20:00" className="bg-deep text-white">20:00 (Prime Dinner)</option>
                    <option value="20:30" className="bg-deep text-white">20:30 (Prime Dinner)</option>
                    <option value="21:00" className="bg-deep text-white">21:00 (Late Seating)</option>
                    <option value="21:30" className="bg-deep text-white">21:30 (Late Seating)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-text-muted font-medium">Guests Count (Covers)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    className="w-full bg-[#111A2E]/80 border border-white/10 rounded-md px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                    required
                    value={partySize}
                    onChange={(e) => setPartySize(parseInt(e.target.value))}
                  />
                </div>
              </div>

              {/* Booking Error logs */}
              {bookingError && (
                <div className="bg-danger/10 border border-danger/20 p-3 rounded-md text-red-400 text-xs">
                  {bookingError}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand hover:bg-brand-hover text-[#0A0E17] font-bold text-sm rounded-md transition-all duration-300 cursor-pointer disabled:opacity-50 border-none shadow-[0_10px_20px_rgba(225,173,36,0.2)]"
              >
                {isSubmitting ? 'Securing Dining Table...' : 'Confirm Table Seating'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dinner Seating Success ticket popup */}
      {isSuccessModal && successTicket && (
        <div className="fixed inset-0 bg-deep/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 text-center border-brand">
            <div className="w-14 h-14 bg-brand/15 border border-brand/30 rounded-full flex items-center justify-center text-brand mx-auto mb-5">
              <Ticket size={24} />
            </div>

            <span className="text-brand text-xs font-semibold uppercase tracking-wider block mb-2">Table Reserved</span>
            <h3 className="text-2xl font-serif text-white mb-2">Fine Dining Seating</h3>
            <p className="text-text-muted text-xs leading-relaxed mb-6">
              Your table reservation is secured. Our Maître D' will escort you upon arrival.
            </p>

            {/* Ticket summary */}
            <div className="bg-deep/50 border border-white/5 rounded-lg p-4 text-left text-xs flex flex-col gap-2.5 mb-6">
              <div className="flex justify-between">
                <span className="text-text-dim">Restaurant</span>
                <strong className="text-text-rich">{successTicket.restaurantName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Seating Zone</span>
                <strong className="text-text-rich">{successTicket.tableLabel}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Reserved Date</span>
                <strong className="text-text-rich">{successTicket.date}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Session Slot</span>
                <strong className="text-text-rich">{successTicket.time}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Party Size</span>
                <strong className="text-text-rich">{successTicket.partySize} Covers</strong>
              </div>
            </div>

            <button 
              className="w-full py-3 bg-brand hover:bg-brand-hover text-[#0A0E17] font-bold text-xs rounded-md transition-colors duration-300 cursor-pointer border-none"
              onClick={() => setIsSuccessModal(false)}
            >
              Return to Dining Catalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dining;
