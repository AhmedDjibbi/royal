import { useHotel } from '../../context/HotelContext.jsx';
import { Clock, Users, Utensils, Calendar } from 'lucide-react';

export const RestaurantControl = () => {
  const { dining } = useHotel();

  // Aggregate all table bookings to render in an admin table
  const allBookings = [];
  dining.forEach(rest => {
    if (rest.tables) {
      rest.tables.forEach(table => {
        if (table.bookedSlots) {
          table.bookedSlots.forEach(slot => {
            allBookings.push({
              id: slot._id || `${rest._id || rest.id}-${table.id}-${slot.date}-${slot.time}`,
              restaurantName: rest.name,
              tableLabel: table.label,
              maxSize: table.size,
              date: slot.date,
              time: slot.time,
              guestName: slot.guestName,
              partySize: slot.partySize
            });
          });
        }
      });
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 animate-fade-in">
      <div className="mb-10">
        <span className="text-brand text-xs tracking-[0.2em] uppercase font-semibold block mb-2">F&B Operations</span>
        <h2 className="text-3xl font-serif text-white m-0">Restaurant Table Seating Tracker</h2>
        <p className="text-text-muted text-xs md:text-sm mt-2 max-w-3xl leading-relaxed">
          Overview of fine dining reservations across L'Agape Signature and Carthage Grill. 
          Monitor peak time cover counts and seat allocations dynamically.
        </p>
      </div>

      {/* Restaurant Capacities overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {dining.map(rest => {
          // Calculate reserved slots count
          const reservedCount = (rest.tables || []).reduce((acc, t) => acc + (t.bookedSlots || []).length, 0);
          return (
            <div key={rest._id || rest.id} className="glass-card bg-brand/4 border-brand/20 p-6 flex justify-between items-center">
              <div>
                <span className="text-brand text-[0.65rem] tracking-widest font-semibold uppercase block">{rest.cuisine}</span>
                <h3 className="text-xl font-serif text-white my-1.5">{rest.name}</h3>
                <span className="text-xs text-text-muted">
                  {(rest.tables || []).length} Total Monitored Seating Zones
                </span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-serif font-semibold text-brand block">
                  {reservedCount}
                </span>
                <span className="text-[0.65rem] text-text-muted uppercase tracking-wider block">
                  Booked Tables
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bookings Queue */}
      <div className="glass-card overflow-hidden p-0 border border-white/5 shadow-2xl">
        <h3 className="text-lg font-serif text-white px-6 py-4 border-b border-white/5 bg-white/2">
          Gastronomy Reservation Queue ({allBookings.length})
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2 text-[0.7rem] uppercase tracking-wider text-text-muted">
                <th className="py-4 px-6 font-semibold">Restaurant Name</th>
                <th className="py-4 px-6 font-semibold">Seating Zone</th>
                <th className="py-4 px-6 font-semibold">Reserved Date</th>
                <th className="py-4 px-6 font-semibold">Session Time</th>
                <th className="py-4 px-6 font-semibold">Registered Guest</th>
                <th className="py-4 px-6 font-semibold text-right">Covers Booked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {allBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-text-muted italic">
                    No fine dining reservations currently logged in database.
                  </td>
                </tr>
              ) : (
                allBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-white/1 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-text-rich">
                        <Utensils size={14} className="text-brand shrink-0" />
                        <strong className="font-semibold">{booking.restaurantName}</strong>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-text-muted">{booking.tableLabel}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-text-muted">
                        <Calendar size={12} className="text-text-dim" />
                        <span>{booking.date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-text-muted">
                        <Clock size={12} className="text-text-dim" />
                        <strong className="font-semibold text-text-rich">{booking.time}</strong>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-text-rich">{booking.guestName}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center gap-1.5 justify-end text-text-muted">
                        <Users size={12} className="text-text-dim" />
                        <span>
                          <strong className="text-white font-semibold">{booking.partySize}</strong> / {booking.maxSize} Covers
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RestaurantControl;
