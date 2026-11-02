import { useHotel } from '../../context/HotelContext.jsx';
import { CalendarDays, DollarSign, Percent, Utensils, MessageSquare, AlertCircle, TrendingUp, BedDouble } from 'lucide-react';

export const Dashboard = ({ setActiveView }) => {
  const { stats, rooms, dining, reviews, reclamations } = useHotel();

  // Aggregate recent events for log feed
  const recentLogs = [];
  
  // Bookings logs
  rooms.forEach(r => {
    if (r.bookings) {
      r.bookings.forEach(b => {
        recentLogs.push({
          type: 'booking',
          text: `Stay reservation logged by ${b.guestName} (${r.name})`,
          amount: `$${b.total || b.totalAmount}`,
          date: b.checkIn,
          icon: <BedDouble size={14} className="text-brand" />
        });
      });
    }
  });

  // Table reservation logs
  dining.forEach(rest => {
    if (rest.tables) {
      rest.tables.forEach(t => {
        if (t.bookedSlots) {
          t.bookedSlots.forEach(s => {
            recentLogs.push({
              type: 'dining',
              text: `Table seating reserved by ${s.guestName} (${rest.name})`,
              amount: `${s.partySize} Covers`,
              date: s.date,
              icon: <Utensils size={14} className="text-info" />
            });
          });
        }
      });
    }
  });

  // Review logs
  reviews.forEach(r => {
    recentLogs.push({
      type: 'review',
      text: `Public review posted: ${r.rating}★ for ${r.category} by ${r.guestName}`,
      amount: 'Social Proof',
      date: r.date || 'Recently',
      icon: <MessageSquare size={14} className="text-success" />
    });
  });

  // Reclamation logs
  reclamations.forEach(c => {
    recentLogs.push({
      type: 'reclamation',
      text: `Private reclamation ticket lodged: "${c.category}" by ${c.guestName}`,
      amount: c.urgency,
      date: c.date || 'Today',
      icon: <AlertCircle size={14} className="text-danger" />
    });
  });

  // Sort logs or slice
  const sortedLogs = recentLogs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 animate-fade-in">
      {/* Header segment */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <span className="text-brand text-xs tracking-[0.2em] uppercase font-semibold block mb-2">Royal Command Center</span>
          <h2 className="text-3xl font-serif text-white m-0">Management Console</h2>
        </div>
        <div className="text-text-muted text-xs bg-white/2 border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-1.5">
          Database Sync Status: <strong className="text-success font-semibold">Active</strong>
        </div>
      </div>

      {/* KPI Stats widgets grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* KPI 1 */}
        <div className="glass-card bg-brand/4 border-brand/20 p-5 flex items-center gap-4">
          <div className="bg-brand/10 w-12 h-12 rounded-xl flex items-center justify-center text-brand shrink-0">
            <DollarSign size={22} />
          </div>
          <div>
            <span className="text-[0.65rem] text-text-muted uppercase tracking-wider block">Revenue Projected</span>
            <strong className="text-xl text-white block mt-0.5">${stats.totalRevenue}</strong>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card bg-brand/4 border-brand/20 p-5 flex items-center gap-4">
          <div className="bg-info/10 w-12 h-12 rounded-xl flex items-center justify-center text-info shrink-0">
            <Percent size={20} />
          </div>
          <div>
            <span className="text-[0.65rem] text-text-muted uppercase tracking-wider block">Occupancy Rate</span>
            <strong className="text-xl text-white block mt-0.5">{stats.roomOccupancyRate}%</strong>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card bg-brand/4 border-brand/20 p-5 flex items-center gap-4">
          <div className="bg-success/10 w-12 h-12 rounded-xl flex items-center justify-center text-success shrink-0">
            <Utensils size={20} />
          </div>
          <div>
            <span className="text-[0.65rem] text-text-muted uppercase tracking-wider block">Dining Covers</span>
            <strong className="text-xl text-white block mt-0.5">{stats.totalRestaurantBookings}</strong>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card bg-brand/4 border-brand/20 p-5 flex items-center gap-4">
          <div className="bg-danger/10 w-12 h-12 rounded-xl flex items-center justify-center text-danger shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="text-[0.65rem] text-text-muted uppercase tracking-wider block">Complaints Alerts</span>
            <strong className="text-xl text-danger block mt-0.5">{stats.pendingTickets} Pending</strong>
          </div>
        </div>
      </div>

      {/* Main console modules section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Recent Guest Logs Feed */}
        <div className="lg:col-span-8 glass-card p-6 md:p-8">
          <span className="text-brand text-xs tracking-widest font-semibold uppercase block mb-2">Live Resort Event Log</span>
          <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand animate-pulse" /> Real-Time Operations Activity
          </h3>

          <div className="space-y-4 max-h-125 overflow-y-auto pr-2">
            {sortedLogs.length === 0 ? (
              <div className="text-text-muted italic text-center py-12">
                No recent guest activity recorded in database.
              </div>
            ) : (
              sortedLogs.map((log, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/2 border border-white/5 p-4 rounded-lg hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/4 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                      {log.icon}
                    </div>
                    <div>
                      <span className="text-xs text-text-rich block font-medium">
                        {log.text}
                      </span>
                      <span className="text-[0.65rem] text-text-dim block mt-0.5">
                        Logged for: {log.date}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 shrink-0">
                    <span className={`text-xs font-semibold ${
                      log.type === 'reclamation' && log.amount === 'High' ? 'text-danger' : 'text-brand'
                    }`}>
                      {log.amount}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Quick Action Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-6 md:p-8 flex flex-col justify-between h-full">
            <div>
              <span className="text-brand text-xs tracking-widest font-semibold uppercase block mb-2">Quick Commands</span>
              <h3 className="text-xl font-serif text-white mb-6">Console Dispatcher</h3>

              <div className="space-y-3.5">
                <button 
                  onClick={() => setActiveView('admin-bookings')} 
                  className="w-full flex justify-between items-center text-left bg-white/2 border border-white/5 hover:border-brand/40 px-4 py-3.5 rounded-lg text-xs font-semibold text-text-rich hover:bg-brand/5 transition-all duration-300 cursor-pointer"
                >
                  <span className="flex items-center gap-2"><BedDouble size={14} className="text-brand" /> Manage Stay Bookings</span>
                  <span>→</span>
                </button>
                <button 
                  onClick={() => setActiveView('admin-rooms')} 
                  className="w-full flex justify-between items-center text-left bg-white/2 border border-white/5 hover:border-brand/40 px-4 py-3.5 rounded-lg text-xs font-semibold text-text-rich hover:bg-brand/5 transition-all duration-300 cursor-pointer"
                >
                  <span className="flex items-center gap-2"><BedDouble size={14} className="text-brand" /> Adjust Suite Pricing</span>
                  <span>→</span>
                </button>
                <button 
                  onClick={() => setActiveView('admin-dining')} 
                  className="w-full flex justify-between items-center text-left bg-white/2 border border-white/5 hover:border-brand/40 px-4 py-3.5 rounded-lg text-xs font-semibold text-text-rich hover:bg-brand/5 transition-all duration-300 cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Utensils size={14} className="text-info" /> Manage Seating Tables</span>
                  <span>→</span>
                </button>
                <button 
                  onClick={() => setActiveView('admin-events')} 
                  className="w-full flex justify-between items-center text-left bg-white/2 border border-white/5 hover:border-brand/40 px-4 py-3.5 rounded-lg text-xs font-semibold text-text-rich hover:bg-brand/5 transition-all duration-300 cursor-pointer"
                >
                  <span className="flex items-center gap-2"><CalendarDays size={14} className="text-brand" /> Publish Resort Events</span>
                  <span>→</span>
                </button>
                <button 
                  onClick={() => setActiveView('admin-feedback')} 
                  className="w-full flex justify-between items-center text-left bg-white/2 border border-white/5 hover:border-brand/40 px-4 py-3.5 rounded-lg text-xs font-semibold text-text-rich hover:bg-brand/5 transition-all duration-300 cursor-pointer"
                >
                  <span className="flex items-center gap-2"><MessageSquare size={14} className="text-danger" /> Resolve Reclamation Tickets</span>
                  <span className="bg-danger text-white px-2 py-0.5 rounded text-[0.6rem] font-bold">
                    {stats.pendingTickets} New
                  </span>
                </button>
              </div>
            </div>

            {/* Quick diagnostic database check */}
            <div className="bg-deep/40 border border-white/5 rounded-xl p-4 mt-8 text-xs text-text-muted space-y-2">
              <strong className="text-white block mb-2 font-serif text-sm">System Diagnostics</strong>
              <div className="flex justify-between">
                <span>Total Suite Types:</span>
                <strong className="text-text-rich">{rooms.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Dining Outlets:</span>
                <strong className="text-text-rich">{dining.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Moderated Reviews:</span>
                <strong className="text-text-rich">{reviews.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Complaint Records:</span>
                <strong className="text-text-rich">{reclamations.length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
