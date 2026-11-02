import { useState } from 'react';
import { useHotel } from '../../context/HotelContext.jsx';
import { Star, ShieldAlert, Check, Edit2 } from 'lucide-react';

export const RoomControl = () => {
  const { rooms, toggleRoomAvailability, updateRoomPrice } = useHotel();
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [priceInput, setPriceInput] = useState('');

  const handleEditClick = (room) => {
    setEditingPriceId(room._id || room.id);
    setPriceInput(room.price.toString());
  };

  const handlePriceSave = async (roomId) => {
    if (!priceInput || isNaN(priceInput)) return;
    try {
      await updateRoomPrice(roomId, parseFloat(priceInput));
      setEditingPriceId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 animate-fade-in">
      <div className="mb-10">
        <span className="text-brand text-xs tracking-[0.2em] uppercase font-semibold block mb-2">Inventory Management</span>
        <h2 className="text-3xl font-serif text-white m-0">Suite Availability & Price Control</h2>
        <p className="text-text-muted text-xs md:text-sm mt-2 max-w-3xl leading-relaxed">
          Dynamically tune room rates and toggle stay serviceability states. Price updates instantly flush the Redis 
          caching layer to align client search indexes immediately.
        </p>
      </div>

      {/* Admin Grid Data-Table */}
      <div className="glass-card overflow-hidden p-0 border border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2 text-[0.7rem] uppercase tracking-wider text-text-muted">
                <th className="py-4 px-6 font-semibold">Suite Description</th>
                <th className="py-4 px-6 font-semibold">Category</th>
                <th className="py-4 px-6 font-semibold">Star Rating</th>
                <th className="py-4 px-6 font-semibold">Dynamic Room Rate</th>
                <th className="py-4 px-6 font-semibold">Stay Availability</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rooms.map(room => (
                <tr key={room._id || room.id} className="hover:bg-white/1 transition-colors text-xs">
                  {/* Suite Info */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={room.image} alt={room.name} className="w-16 h-10 object-cover rounded-md shadow-md shrink-0 bg-white/5" />
                      <div>
                        <strong className="text-white text-sm font-semibold block">{room.name}</strong>
                        <span className="text-[0.65rem] text-text-dim block mt-0.5">Max {room.maxGuests} guests occupancy</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Category */}
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded text-[0.65rem] font-semibold bg-brand/10 text-brand border border-brand/20">
                      {room.type}
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-brand">
                      <Star size={12} fill="currentColor" />
                      <strong>{room.rating}</strong>
                    </div>
                  </td>

                  {/* Pricing (Inline Editor) */}
                  <td className="py-4 px-6">
                    {editingPriceId === (room._id || room.id) ? (
                      <div className="flex items-center gap-2">
                        <span className="text-brand font-semibold">$</span>
                        <input
                          type="number"
                          className="bg-[#111A2E]/85 border border-brand/40 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-brand w-20"
                          value={priceInput}
                          onChange={(e) => setPriceInput(e.target.value)}
                        />
                        <button
                          className="p-1.5 bg-brand hover:bg-brand-hover text-[#0A0E17] rounded cursor-pointer border-none"
                          onClick={() => handlePriceSave(room._id || room.id)}
                        >
                          <Check size={12} strokeWidth={3} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <strong className="text-brand text-sm font-semibold">${room.price}</strong>
                        <button
                          className="bg-transparent border-none cursor-pointer text-text-dim hover:text-brand transition-colors p-1"
                          onClick={() => handleEditClick(room)}
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Status Toggle */}
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded text-[0.65rem] font-semibold border ${
                      room.available 
                        ? 'bg-success/10 text-success border-success/20' 
                        : 'bg-danger/10 text-red-400 border-danger/20'
                    }`}>
                      {room.available ? 'Active Serviceable' : 'Blocked (Maintenance)'}
                    </span>
                  </td>

                  {/* Action Commands */}
                  <td className="py-4 px-6 text-right">
                    <button
                      className={`px-4 py-2 text-[0.65rem] font-semibold rounded cursor-pointer transition-colors flex items-center gap-1.5 ml-auto border-none ${
                        room.available 
                          ? 'bg-danger/10 hover:bg-danger/20 text-red-400 border border-danger/20' 
                          : 'bg-brand hover:bg-brand-hover text-deep'
                      }`}
                      onClick={() => toggleRoomAvailability(room._id || room.id)}
                    >
                      <ShieldAlert size={12} />
                      {room.available ? 'Block Suite' : 'Activate Suite'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoomControl;
