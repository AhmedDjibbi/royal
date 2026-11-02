import { useState } from 'react';
import { useHotel } from '../../context/HotelContext.jsx';
import { useUser } from '../../context/UserContext.jsx';
import { Star, Check, Calendar, Users, X, Receipt } from 'lucide-react';

export const Rooms = ({ onRequireAuth }) => {
  const { rooms, bookRoom, loading } = useHotel();
  const { user } = useUser();

  // Booking Modal management
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [addons, setAddons] = useState([]);
  
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add-on options list
  const addonOptions = [
    { id: 'butler', label: 'Personal 24/7 Butler Service (+$100 / night)', price: 100, isPerNight: true },
    { id: 'spa', label: 'Royal Elysa Thalasso Spa Unlimited Access (+$50 / night)', price: 50, isPerNight: true },
    { id: 'airport', label: 'Luxury Private Airport Roundtrip Transfer (+$80 flat)', price: 80, isPerNight: false }
  ];

  const handleAddonClick = (addonId) => {
    if (addons.includes(addonId)) {
      setAddons(prev => prev.filter(id => id !== addonId));
    } else {
      setAddons(prev => [...prev, addonId]);
    }
  };

  // Calculations
  const calculateDuration = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end - start;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const calculateTotal = (room) => {
    const days = calculateDuration();
    if (days === 0) return 0;

    let base = room.price * days;
    
    let addonCharge = 0;
    addons.forEach(id => {
      const option = addonOptions.find(o => o.id === id);
      if (option) {
        if (option.isPerNight) {
          addonCharge += option.price * days;
        } else {
          addonCharge += option.price;
        }
      }
    });

    return base + addonCharge;
  };

  const resetForm = () => {
    setSelectedRoom(null);
    setCheckIn('');
    setCheckOut('');
    setGuestsCount(1);
    setAddons([]);
    setBookingError('');
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setBookingError('Please select both Check-In and Check-Out dates.');
      return;
    }

    const duration = calculateDuration();
    if (duration <= 0) {
      setBookingError('Check-Out date must be after Check-In date.');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      const totalAmount = calculateTotal(selectedRoom);
      if (!user) {
        setBookingError('Sign in or create a guest account before reserving.');
        onRequireAuth();
        return;
      }
      const bookingResponse = await bookRoom(
        selectedRoom._id || selectedRoom.id,
        checkIn,
        checkOut,
        user.name,
        guestsCount,
        totalAmount,
        addons
      );
      const confirmedTotal = bookingResponse.booking?.totalAmount ?? bookingResponse.booking?.total ?? totalAmount;
      
      setSuccessReceipt({
        roomName: selectedRoom.name,
        checkIn,
        checkOut,
        guestsCount,
        duration,
        totalAmount: confirmedTotal
      });
      setIsSuccessModal(true);
      resetForm();
    } catch (err) {
      setBookingError(err.message || 'The chosen room is not available for those dates.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-20 text-center">
        <div className="text-brand text-lg font-serif">Loading Royal Suites catalog...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 animate-fade-in">
      <div className="text-center mb-16">
        <span className="text-brand text-xs tracking-[0.2em] uppercase font-semibold block mb-3">Royal Accommodations</span>
        <h2 className="text-4xl font-serif text-white mb-6">Luxury Suites & Bungalows</h2>
        <p className="text-text-muted max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Select from our bespoke sea-view suites, private garden bungalows, or premium floor residences. 
          Enjoy personalized dynamic pricing and unique wellness inclusions during your stay at Royal Talassa.
        </p>
      </div>

      {/* Catalog List */}
      <div className="flex flex-col gap-10">
        {rooms.map(room => (
          <div key={room._id || room.id} className="glass-card hover:glass-card-hover grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-8 items-center">
            {/* Left image and specs */}
            <div className="lg:col-span-7 relative overflow-hidden rounded-xl">
              <img src={room.image} alt={room.name} className="w-full h-72 md:h-96 object-cover shadow-2xl transition-transform duration-700 hover:scale-105" />
              <div className="absolute top-4 right-4 bg-deep/85 backdrop-blur-md px-4 py-2 rounded-full border border-brand/30 text-brand font-semibold text-sm">
                ${room.price} / Night
              </div>
            </div>

            {/* Right text specs & action */}
            <div className="lg:col-span-5 flex flex-col h-full justify-between py-2">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-brand text-xs tracking-wider font-semibold uppercase">{room.type}</span>
                  <div className="flex items-center gap-1 text-brand text-sm">
                    <Star size={14} fill="currentColor" />
                    <strong>{room.rating}</strong>
                  </div>
                </div>
                
                <h3 className="text-2xl font-serif text-white mb-4">{room.name}</h3>
                <p className="text-text-muted text-sm leading-relaxed mb-6">
                  {room.description}
                </p>

                {/* Room Specifications Highlights */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(room.features || []).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-text-rich">
                      <Check size={14} className="text-brand shrink-0" />
                      <span className="truncate">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex justify-between items-center border-t border-white/5 pt-5 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-text-dim">
                  <Users size={14} />
                  <span>Up to {room.maxGuests} Guests Max</span>
                </div>

                {room.available ? (
                  <button 
                    className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-[#0A0E17] font-semibold text-xs rounded-md shadow-md transition-all duration-300 cursor-pointer border-none"
                    onClick={() => user ? setSelectedRoom(room) : onRequireAuth()}
                  >
                    Reserve This Suite
                  </button>
                ) : (
                  <span className="px-3 py-1 text-xs font-semibold rounded bg-danger/10 text-red-400 border border-danger/20">
                    Out of Service
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Check-In Modal Overlay */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-deep/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={resetForm} 
              className="absolute top-4 right-4 bg-transparent border-none text-text-muted hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <span className="text-brand text-xs tracking-widest font-semibold uppercase block mb-2">Interactive Stay Booking</span>
            <h3 className="text-2xl font-serif text-white mb-6">{selectedRoom.name}</h3>

            <form onSubmit={handleBookSubmit} className="space-y-5">
              {/* Dates grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-text-muted font-medium flex items-center gap-1.5">
                    <Calendar size={12} className="text-brand" /> Check-In Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full bg-[#111A2E]/80 border border-white/10 rounded-md px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-text-muted font-medium flex items-center gap-1.5">
                    <Calendar size={12} className="text-brand" /> Check-Out Date
                  </label>
                  <input
                    type="date"
                    min={checkIn || new Date().toISOString().slice(0, 10)}
                    className="w-full bg-[#111A2E]/80 border border-white/10 rounded-md px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>

              {/* Guest size select */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted font-medium">Number of Guests</label>
                <select
                  className="w-full bg-[#111A2E]/80 border border-white/10 rounded-md px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                >
                  {[...Array(selectedRoom.maxGuests)].map((_, idx) => (
                    <option key={idx + 1} value={idx + 1} className="bg-deep text-white">
                      {idx + 1} {idx + 1 === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Addons Checkbox list */}
              <div className="space-y-2">
                <label className="text-xs text-text-muted font-medium block">Premium Resort Add-Ons</label>
                <div className="flex flex-col gap-2.5">
                  {addonOptions.map(option => {
                    const active = addons.includes(option.id);
                    return (
                      <div
                        key={option.id}
                        onClick={() => handleAddonClick(option.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 border ${
                          active 
                            ? 'bg-brand/8 border-brand shadow-[0_0_15px_rgba(225,173,36,0.1)]' 
                            : 'bg-white/2 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                          active ? 'bg-brand border-brand text-deep' : 'border-brand/50'
                        }`}>
                          {active && <Check size={10} strokeWidth={4} />}
                        </div>
                        <span className="text-xs text-text-rich">{option.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Live Cost Tally */}
              {calculateDuration() > 0 && (
                <div className="glass-card bg-white/2 border-brand/20 p-4 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-text-muted block">
                      Stay Cost Summary ({calculateDuration()} Nights)
                    </span>
                    <div className="text-[0.7rem] text-text-dim">
                      Base stay: ${selectedRoom.price} × {calculateDuration()} nights
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl text-brand font-bold">
                      ${calculateTotal(selectedRoom)}
                    </span>
                  </div>
                </div>
              )}

              {/* Error log */}
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
                {isSubmitting ? 'Validating Availability...' : `Reserve Stay for $${calculateTotal(selectedRoom)}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stay Success Ticket Popup */}
      {isSuccessModal && successReceipt && (
        <div className="fixed inset-0 bg-deep/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 text-center border-brand">
            <div className="w-14 h-14 bg-success/15 border border-success/30 rounded-full flex items-center justify-center text-success mx-auto mb-5">
              <Receipt size={24} />
            </div>

            <span className="text-success text-xs font-semibold uppercase tracking-wider block mb-2">Reservation Confirmed</span>
            <h3 className="text-2xl font-serif text-white mb-2">Welcome to Royal Talassa!</h3>
            <p className="text-text-muted text-xs leading-relaxed mb-6">
              Your reservation is registered on our database. A personal host will coordinate your check-in details.
            </p>

            {/* Bill Ticket */}
            <div className="bg-deep/50 border border-white/5 rounded-lg p-4 text-left text-xs flex flex-col gap-2.5 mb-6">
              <div className="flex justify-between">
                <span className="text-text-dim">Suite Type</span>
                <strong className="text-text-rich">{successReceipt.roomName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Check-In</span>
                <strong className="text-text-rich">{successReceipt.checkIn}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Check-Out</span>
                <strong className="text-text-rich">{successReceipt.checkOut}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Guests Registered</span>
                <strong className="text-text-rich">{successReceipt.guestsCount}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Duration Stay</span>
                <strong className="text-text-rich">{successReceipt.duration} Nights</strong>
              </div>
              <div className="h-px bg-white/5 my-1"></div>
              <div className="flex justify-between text-sm">
                <span className="text-brand font-semibold">Total Tally</span>
                <strong className="text-brand font-bold">${successReceipt.totalAmount}</strong>
              </div>
            </div>

            <button 
              className="w-full py-3 bg-brand hover:bg-brand-hover text-[#0A0E17] font-bold text-xs rounded-md transition-colors duration-300 cursor-pointer border-none"
              onClick={() => setIsSuccessModal(false)}
            >
              Proceed to Resort Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
