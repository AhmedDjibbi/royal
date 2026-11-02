import { useState } from 'react';
import { useHotel } from '../../context/HotelContext.jsx';
import { useUser } from '../../context/UserContext.jsx';
import { Star, AlertTriangle, Clock, Heart } from 'lucide-react';

export const Feedback = () => {
  const { reviews, reclamations, addReview, addReclamation, loading } = useHotel();
  const { user } = useUser();

  const [activeSubTab, setActiveSubTab] = useState('reviews'); // 'reviews' or 'reclamations'

  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewCategory, setReviewCategory] = useState('Overall');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Reclamation Form States
  const [claimCategory, setClaimCategory] = useState('Maintenance');
  const [claimUrgency, setClaimUrgency] = useState('Medium');
  const [claimDesc, setClaimDesc] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment) return;

    try {
      await addReview(user.name, reviewRating, reviewCategory, reviewComment);
      setReviewSuccess(true);
      setReviewComment('');
      setReviewRating(5);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimDesc) return;

    try {
      await addReclamation(user.name, user.roomNumber || 'Suite 304', claimCategory, claimUrgency, claimDesc);
      setClaimSuccess(true);
      setClaimDesc('');
      setTimeout(() => setClaimSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-20 text-center">
        <div className="text-brand text-lg font-serif">Loading feedback registry...</div>
      </div>
    );
  }

  // Filter complaints logged by the currently logged-in guest to make it personal
  const myClaims = reclamations.filter(c => c.guestName === user.name);

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <span className="text-brand text-xs tracking-[0.2em] uppercase font-semibold block mb-3">Accolades & Resolution</span>
        <h2 className="text-4xl font-serif text-white mb-6">Feedback & Reclamations</h2>
        <p className="text-text-muted max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-8">
          We hold our standards to the absolute highest tier. Share your five-star review with future resort guests, 
          or lodge a private complaint ticket if anything during your stay requires administrative maintenance.
        </p>

        {/* Tab Selector */}
        <div className="inline-flex bg-white/2 border border-white/5 rounded-full p-1">
          <button
            onClick={() => setActiveSubTab('reviews')}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer border-none ${
              activeSubTab === 'reviews' 
                ? 'bg-brand text-deep shadow-md' 
                : 'text-text-muted hover:text-white bg-transparent'
            }`}
          >
            Public Guest Reviews
          </button>
          <button
            onClick={() => setActiveSubTab('reclamations')}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer border-none ${
              activeSubTab === 'reclamations' 
                ? 'bg-brand text-deep shadow-md' 
                : 'text-text-muted hover:text-white bg-transparent'
            }`}
          >
            Lodge Private Reclamation
          </button>
        </div>
      </div>

      {activeSubTab === 'reviews' ? (
        /* ================= REVIEW SECTION ================= */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Panel: Review Form */}
          <div className="glass-card p-6 md:p-8">
            <span className="text-brand text-xs tracking-widest font-semibold uppercase block mb-2">Write an Experience review</span>
            <h3 className="text-2xl font-serif text-white mb-6">Share Your Experience</h3>

            <form onSubmit={handleReviewSubmit} className="space-y-5">
              {/* Rating stars selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted font-medium">Overall Star Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(starNum => (
                    <button
                      key={starNum}
                      type="button"
                      onClick={() => setReviewRating(starNum)}
                      className="bg-transparent border-none cursor-pointer outline-none p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        fill={starNum <= reviewRating ? '#e1ad24' : 'transparent'}
                        className="text-brand"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted font-medium">Review Category</label>
                <select
                  className="w-full bg-[#111A2E]/80 border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                  value={reviewCategory}
                  onChange={(e) => setReviewCategory(e.target.value)}
                >
                  <option value="Overall" className="bg-deep text-white">Overall Resort Stay</option>
                  <option value="Service" className="bg-deep text-white">Butler & Staff Service</option>
                  <option value="Dining" className="bg-deep text-white">Gastronomy & Dining</option>
                  <option value="Rooms" className="bg-deep text-white">Suites & In-room Luxury</option>
                </select>
              </div>

              {/* Comment */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted font-medium">Detailed Review Note</label>
                <textarea
                  className="w-full bg-[#111A2E]/80 border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                  rows="4"
                  required
                  placeholder="Describe the hospitality, spa quality, Skanes beach view, or restaurant covers during your stay..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                ></textarea>
              </div>

              {reviewSuccess && (
                <div className="bg-success/10 border border-success/20 p-3 rounded-md text-success text-xs flex items-center gap-2">
                  <Heart size={14} className="shrink-0" /> Review posted successfully! Thank you for sharing.
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-3 bg-brand hover:bg-brand-hover text-[#0A0E17] font-bold text-sm rounded-md transition-all duration-300 cursor-pointer border-none shadow-[0_10px_20px_rgba(225,173,36,0.2)]"
              >
                Publish Review
              </button>
            </form>
          </div>

          {/* Right Panel: Reviews Catalog Feed */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-serif text-white border-b border-white/5 pb-3">
              Guest Feedback Logs ({reviews.length})
            </h3>
            
            {reviews.length === 0 ? (
              <div className="text-text-muted italic text-center py-12">
                No public reviews currently posted. Be the first to review!
              </div>
            ) : (
              <div className="space-y-4 max-h-150 overflow-y-auto pr-2">
                {reviews.map(rev => (
                  <div key={rev._id || rev.id} className="glass-card hover:glass-card-hover p-5 border border-white/5">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <strong className="text-white text-sm font-semibold">{rev.guestName}</strong>
                        <span className="px-2 py-0.5 ml-2.5 rounded text-[0.65rem] font-semibold bg-brand/10 text-brand border border-brand/20">
                          {rev.category}
                        </span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={12} fill="#e1ad24" className="text-brand" />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-text-muted text-xs leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                    
                    <span className="text-[0.65rem] text-text-dim block mt-3 text-right">
                      Logged on {rev.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= RECLAMATION SECTION ================= */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Panel: Complaint Form */}
          <div className="glass-card p-6 md:p-8">
            <span className="text-brand text-xs tracking-widest font-semibold uppercase block mb-2">Administrative Ticketing</span>
            <h3 className="text-2xl font-serif text-white mb-6">Lodge a Reclamation</h3>

            <form onSubmit={handleClaimSubmit} className="space-y-5">
              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted font-medium">Problem Category</label>
                <select
                  className="w-full bg-[#111A2E]/80 border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                  value={claimCategory}
                  onChange={(e) => setClaimCategory(e.target.value)}
                >
                  <option value="Maintenance" className="bg-deep text-white">Maintenance (Electrical, AC, Hot Tub, Plumbing)</option>
                  <option value="Housekeeping" className="bg-deep text-white">Housekeeping (Towels, Bed Linens, Cleans)</option>
                  <option value="Rooms" className="bg-deep text-white">Suites (Mini-bar, Butler, Noise)</option>
                  <option value="Dining" className="bg-deep text-white">Gastronomy Service issues</option>
                  <option value="Other" className="bg-deep text-white">Other Miscellaneous operational issues</option>
                </select>
              </div>

              {/* Urgency */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted font-medium">Urgency Priority Weight</label>
                <select
                  className="w-full bg-[#111A2E]/80 border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                  value={claimUrgency}
                  onChange={(e) => setClaimUrgency(e.target.value)}
                >
                  <option value="Low" className="bg-deep text-white">Low Priority (No disruption to sleep or health)</option>
                  <option value="Medium" className="bg-deep text-white">Medium Priority (Slight inconvenience - Balcony tub heating, Mini-bar)</option>
                  <option value="High" className="bg-deep text-white">High Priority (Severe disruption - AC rattling, Room locks)</option>
                </select>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted font-medium">Describe the Issue</label>
                <textarea
                  className="w-full bg-[#111A2E]/80 border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                  rows="4"
                  required
                  placeholder="Describe precisely the issue and include your Room or Bungalow Suite number..."
                  value={claimDesc}
                  onChange={(e) => setClaimDesc(e.target.value)}
                ></textarea>
              </div>

              {claimSuccess && (
                <div className="bg-warning/10 border border-warning/20 p-3 rounded-md text-amber-400 text-xs flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" /> Ticket registered successfully. Check active queue on right panel.
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-3 bg-brand hover:bg-brand-hover text-[#0A0E17] font-bold text-sm rounded-md transition-all duration-300 cursor-pointer border-none shadow-[0_10px_20px_rgba(225,173,36,0.2)]"
              >
                Log Complaint Ticket
              </button>
            </form>
          </div>

          {/* Right Panel: Guest's Live Tickets Queue */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-serif text-white border-b border-white/5 pb-3">
              My Active Reclamations Queue ({myClaims.length})
            </h3>
            
            {myClaims.length === 0 ? (
              <div className="text-text-muted italic text-center py-12">
                No active complaints registered. Thank you for your stay!
              </div>
            ) : (
              <div className="space-y-4 max-h-150 overflow-y-auto pr-2">
                {myClaims.map(ticket => (
                  <div key={ticket._id || ticket.id} className="glass-card hover:glass-card-hover p-5 border-l-4 border border-white/5" style={{
                    borderLeftColor: ticket.urgency === 'High' ? '#EF4444' : ticket.urgency === 'Medium' ? '#F59E0B' : '#10B981'
                  }}>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <strong className="text-white text-sm font-semibold">{ticket.category} Ticket</strong>
                        <span className="text-xs text-text-muted ml-2">
                          ({ticket.roomNumber})
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold border ${
                        ticket.status === 'Resolved' 
                          ? 'bg-success/10 text-success border-success/20' 
                          : ticket.status === 'In Progress' 
                            ? 'bg-warning/10 text-amber-400 border-warning/20' 
                            : 'bg-brand/10 text-brand border-brand/20'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>

                    <p className="text-text-muted text-xs leading-relaxed mb-4">
                      "{ticket.description}"
                    </p>

                    {/* Admin notes if resolved/in progress */}
                    {ticket.response ? (
                      <div className="bg-deep/40 p-3 rounded border border-white/5 text-xs mb-4">
                        <strong className="text-brand block mb-1">
                          🏨 Admin Note:
                        </strong>
                        <span className="text-text-rich">"{ticket.response}"</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[0.65rem] text-text-dim mb-4">
                        <Clock size={10} /> Pending dispatcher allocation.
                      </div>
                    )}

                    <div className="flex justify-between text-[0.65rem] text-text-dim pt-2 border-t border-white/5">
                      <span>Urgency: <strong style={{ color: ticket.urgency === 'High' ? '#EF4444' : '#F59E0B' }}>{ticket.urgency}</strong></span>
                      <span>Logged on {ticket.date ? ticket.date.split('T')[0] : 'Today'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
