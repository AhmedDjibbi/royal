import { useState } from 'react';
import { useHotel } from '../../context/HotelContext.jsx';
import { useUser } from '../../context/UserContext.jsx';
import { Calendar, Check, Users, Clock, DollarSign, QrCode } from 'lucide-react';

export const Activities = ({ onRequireAuth }) => {
  const { activities, events, registerForActivity, registerForEvent, loading } = useHotel();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState('activities'); // 'activities' or 'events'
  
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [successPass, setSuccessPass] = useState(null);
  const [registerError, setRegisterError] = useState('');

  const handleRegister = async (plan) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    // Check if capacity reached
    if (plan.isRegistered || (plan.registered || []).includes(user.name)) {
      setRegisterError('You are already registered for this schedule.');
      return;
    }

    if ((plan.registeredCount ?? plan.registered?.length ?? 0) >= plan.capacity) {
      setRegisterError('This event is fully booked.');
      return;
    }

    setRegisterError('');

    try {
      if (plan.type === 'Activity') {
        await registerForActivity(plan._id || plan.id, user.name);
      } else {
        await registerForEvent(plan._id || plan.id, user.name);
      }

      setSuccessPass({
        name: plan.name,
        date: plan.date,
        time: plan.time,
        price: plan.price,
        category: plan.category || 'Resort Schedule',
        guestName: user.name,
        passNumber: String(plan._id || plan.id).slice(-6).toUpperCase()
      });
      setIsSuccessModal(true);
    } catch (err) {
      setRegisterError(err.message || 'Error processing registration.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-20 text-center">
        <div className="text-brand text-lg font-serif">Loading active schedules...</div>
      </div>
    );
  }

  const activePlans = activeTab === 'activities' ? activities : events;

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <span className="text-brand text-xs tracking-[0.2em] uppercase font-semibold block mb-3">Resort Active Plans</span>
        <h2 className="text-4xl font-serif text-white mb-6">Activities & Special Events</h2>
        <p className="text-text-muted max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-8">
          Enrich your five-star stay at Royal Talassa. Register for thalassotherapy seawater pools cures, 
          sunset champagne sailing expeditions, morning yoga, or beachfront symphonic violin galas.
        </p>

        {/* Tab Swappers */}
        <div className="inline-flex bg-white/2 border border-white/5 rounded-full p-1">
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer border-none ${
              activeTab === 'activities' 
                ? 'bg-brand text-deep shadow-md' 
                : 'text-text-muted hover:text-white bg-transparent'
            }`}
          >
            Daily Resort Activities
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer border-none ${
              activeTab === 'events' 
                ? 'bg-brand text-deep shadow-md' 
                : 'text-text-muted hover:text-white bg-transparent'
            }`}
          >
            Seasonal Gala Events
          </button>
        </div>
      </div>

      {/* Grid displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activePlans.map(plan => {
          const registered = plan.isRegistered || Boolean(user && (plan.registered || []).includes(user.name));
          const registeredCount = plan.registeredCount ?? plan.registered?.length ?? 0;
          return (
            <div key={plan._id || plan.id} className="glass-card hover:glass-card-hover gold-card flex flex-col p-0 overflow-hidden border border-white/5">
              <div className="relative h-48 w-full">
                <img src={plan.image} alt={plan.name} className="w-full h-full object-cover border-b border-white/5" />
                <div className="absolute inset-0 bg-linear-to-t from-deep/40 to-transparent" />
              </div>

              <div className="p-6 flex flex-col grow justify-between">
                <div>
                  <span className="text-brand text-[0.7rem] tracking-widest font-semibold uppercase block mb-1">
                    {plan.category}
                  </span>
                  
                  <h3 className="text-lg font-serif text-white mb-2 leading-tight">{plan.name}</h3>
                  
                  <p className="text-text-muted text-xs leading-relaxed mb-4">
                    {plan.description}
                  </p>
                </div>

                <div>
                  {/* Details list */}
                  <div className="flex flex-col gap-2 text-[0.75rem] text-text-rich border-t border-white/5 pt-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-brand" />
                      <span>{plan.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-brand" />
                      <span>{plan.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={12} className="text-brand" />
                      <span>{plan.price === 0 ? 'Complimentary' : `$${plan.price} / Guest`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={12} className="text-brand" />
                      <span>
                        {registeredCount} / {plan.capacity} Registered ({Math.max(0, plan.capacity - registeredCount)} spaces left)
                      </span>
                    </div>
                  </div>

                  {/* Register CTA */}
                  {registered ? (
                    <div className="w-full py-2.5 bg-success/10 border border-success/20 rounded-md text-success text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Check size={12} /> Registered Guest
                    </div>
                  ) : registeredCount >= plan.capacity ? (
                    <button disabled className="w-full py-2.5 bg-white/5 border border-white/10 rounded-md text-text-dim text-xs font-semibold cursor-not-allowed">
                      Fully booked
                    </button>
                  ) : (
                    <button
                      className="w-full py-2.5 bg-brand hover:bg-brand-hover text-[#0A0E17] font-semibold text-xs rounded-md transition-all duration-300 cursor-pointer border-none shadow-[0_4px_12px_rgba(225,173,36,0.15)]"
                      onClick={() => handleRegister(plan)}
                    >
                      Confirm Register Pass
                    </button>
                  )}
                </div>
              </div>

              {registerError && !isSuccessModal && (
                <div role="alert" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card border border-danger/30 text-red-300 px-5 py-3 rounded-lg shadow-xl text-sm">
                  {registerError}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ticket Pass Success Popup */}
      {isSuccessModal && successPass && (
        <div className="fixed inset-0 bg-deep/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 text-center border-brand">
            <div className="w-14 h-14 bg-success/15 border border-success/30 rounded-full flex items-center justify-center text-success mx-auto mb-5">
              <QrCode size={24} />
            </div>

            <span className="text-success text-xs font-semibold uppercase tracking-wider block mb-2">Registration Confirmed</span>
            <h3 className="text-2xl font-serif text-white mb-6">Digital Guest Pass</h3>

            {/* QR Code Ticket */}
            <div className="bg-white rounded-xl p-5 text-deep text-left text-xs mb-6 shadow-2xl relative border-2 border-brand/50">
              <div className="absolute inset-2 border border-dashed border-brand/35 rounded-lg pointer-events-none"></div>

              <div className="flex justify-between mb-2 font-bold text-text-dim">
                <span>EXCURSION PASS</span>
                <span className="text-brand">#{successPass.passNumber}</span>
              </div>
              <h4 className="text-base font-bold text-deep mb-3 border-b border-deep/10 pb-2">
                {successPass.name}
              </h4>
              
              <div className="space-y-1.5 font-medium">
                <div><span className="text-text-dim font-normal block">REGISTERED GUEST</span> <strong className="text-deep">{successPass.guestName}</strong></div>
                <div><span className="text-text-dim font-normal block">DATE</span> <strong className="text-deep">{successPass.date}</strong></div>
                <div><span className="text-text-dim font-normal block">SCHEDULE TIME</span> <strong className="text-deep">{successPass.time}</strong></div>
                <div><span className="text-text-dim font-normal block">ADMISSION PRICE</span> <strong className="text-deep">{successPass.price === 0 ? 'Complimentary' : `$${successPass.price}`}</strong></div>
              </div>

              {/* QR Mock code */}
              <div className="flex justify-center mt-5">
                <div className="bg-deep p-2.5 rounded-lg flex items-center justify-center">
                  <QrCode size={80} className="text-white" />
                </div>
              </div>
            </div>

            {registerError && <p role="alert" className="text-red-400 text-xs mb-4">{registerError}</p>}

            <button 
              className="w-full py-3 bg-brand hover:bg-brand-hover text-[#0A0E17] font-bold text-xs rounded-md transition-colors duration-300 cursor-pointer border-none"
              onClick={() => setIsSuccessModal(false)}
            >
              Add to Active Guest Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
