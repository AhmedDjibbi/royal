import { useState } from 'react';
import { useHotel } from '../../context/HotelContext.jsx';
import { AlertCircle, MessageCircle, Search, Send, X } from 'lucide-react';

export const FeedbackControl = () => {
  const { reclamations, resolveReclamation, updateReclamationStatus } = useHotel();
  
  // Selected ticket for administrative reply
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const [statusInput, setStatusInput] = useState('In Progress');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');

  const visibleTickets = reclamations.filter((ticket) => {
    const matchesText = `${ticket.guestName} ${ticket.category} ${ticket.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesText
      && (statusFilter === 'All' || ticket.status === statusFilter)
      && (urgencyFilter === 'All' || ticket.urgency === urgencyFilter);
  });

  const handleOpenReply = (ticket) => {
    setSelectedTicket(ticket);
    setStatusInput(ticket.status === 'Pending' ? 'In Progress' : ticket.status);
    setReplyInput(ticket.response || '');
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyInput) return;

    setIsSubmitting(true);
    try {
      const ticketId = selectedTicket._id || selectedTicket.id;
      await resolveReclamation(ticketId, replyInput);
      await updateReclamationStatus(ticketId, statusInput);
      setSelectedTicket(null);
      setReplyInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 animate-fade-in">
      <div className="mb-10">
        <span className="text-brand text-xs tracking-[0.2em] uppercase font-semibold block mb-2">Customer Care Registry</span>
        <h2 className="text-3xl font-serif text-white m-0">Guest Reclamations & Complaints</h2>
        <p className="text-text-muted text-xs md:text-sm mt-2 max-w-3xl leading-relaxed">
          Resolve guest-reported issues and maintain five-star operational standards. 
          Urgent tickets represent high-priority stay disruptions.
        </p>
      </div>

      {/* Ticket List Data-Table */}
      <div className="glass-card overflow-hidden p-0 border border-white/5 shadow-2xl">
        <h3 className="text-lg font-serif text-white px-6 py-4 border-b border-white/5 bg-white/2">
          Reclamation Dispatcher Queue ({reclamations.length})
        </h3>

        <div className="booking-tools admin-filter-tools">
          <label className="booking-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search guest, category, or issue" aria-label="Search guest-care requests" /></label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by request status"><option>All</option><option>Pending</option><option>In Progress</option><option>Resolved</option></select>
          <select value={urgencyFilter} onChange={(event) => setUrgencyFilter(event.target.value)} aria-label="Filter by urgency"><option>All</option><option>High</option><option>Medium</option><option>Low</option></select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2 text-[0.7rem] uppercase tracking-wider text-text-muted">
                <th className="py-4 px-6 font-semibold">Guest & Suite</th>
                <th className="py-4 px-6 font-semibold">Category</th>
                <th className="py-4 px-6 font-semibold">Issue Details</th>
                <th className="py-4 px-6 font-semibold">Urgency Priority</th>
                <th className="py-4 px-6 font-semibold">Process State</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {visibleTickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-text-muted italic">
                    {reclamations.length === 0 ? 'No reclamation tickets logged. Operational levels nominal!' : 'No requests match those filters.'}
                  </td>
                </tr>
              ) : (
                visibleTickets.map(ticket => (
                  <tr key={ticket._id || ticket.id} className="hover:bg-white/1 transition-colors">
                    {/* Guest name */}
                    <td className="py-4 px-6">
                      <div>
                        <strong className="text-white text-sm font-semibold block">{ticket.guestName}</strong>
                        <span className="text-[0.65rem] text-text-dim block mt-0.5">Room: {ticket.roomNumber}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[0.65rem] font-semibold bg-brand/10 text-brand border border-brand/20">
                        {ticket.category}
                      </span>
                    </td>

                    {/* Issue Description */}
                    <td className="py-4 px-6">
                      <div className="max-w-70 truncate">
                        <span className="text-text-rich" title={ticket.description}>
                          "{ticket.description}"
                        </span>
                        {ticket.response && (
                          <span className="text-[0.65rem] text-brand block mt-1 truncate">
                            Reply: "{ticket.response}"
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Urgency */}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded text-[0.65rem] font-semibold border inline-flex items-center gap-1 ${
                        ticket.urgency === 'High' 
                          ? 'bg-danger/10 text-red-400 border-danger/20' 
                          : ticket.urgency === 'Medium' 
                            ? 'bg-warning/10 text-amber-400 border-warning/20' 
                            : 'bg-success/10 text-success border-success/20'
                      }`}>
                        <AlertCircle size={10} />
                        {ticket.urgency}
                      </span>
                    </td>

                    {/* Process Status */}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded text-[0.65rem] font-semibold border ${
                        ticket.status === 'Resolved' 
                          ? 'bg-success/10 text-success border-success/20' 
                          : ticket.status === 'In Progress' 
                            ? 'bg-warning/10 text-amber-400 border-warning/20' 
                            : 'bg-brand/10 text-brand border-brand/20'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        className="px-4 py-2 bg-brand hover:bg-brand-hover text-[#0A0E17] font-semibold text-[0.65rem] rounded cursor-pointer transition-colors inline-flex items-center gap-1.5 border-none"
                        onClick={() => handleOpenReply(ticket)}
                      >
                        <MessageCircle size={12} />
                        Process Ticket
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Process Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-deep/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedTicket(null)} 
              className="absolute top-4 right-4 bg-transparent border-none text-text-muted hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <span className="text-brand text-xs tracking-widest font-semibold uppercase block mb-2">Ticket Dispatch Center</span>
            <h3 className="text-2xl font-serif text-white mb-6">Resolve Reclamation</h3>

            {/* Ticket details */}
            <div className="bg-white/2 border border-white/5 rounded-lg p-4 text-xs space-y-2.5 mb-6">
              <div className="flex justify-between">
                <span className="text-text-dim">Guest Staying</span>
                <strong className="text-text-rich">{selectedTicket.guestName} ({selectedTicket.roomNumber})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Urgency Level</span>
                <strong className={selectedTicket.urgency === 'High' ? 'text-danger' : 'text-brand'}>
                  {selectedTicket.urgency} Priority
                </strong>
              </div>
              <div className="h-px bg-white/5 my-1"></div>
              <p className="italic text-text-muted">
                "{selectedTicket.description}"
              </p>
            </div>

            <form onSubmit={handleReplySubmit} className="space-y-5">
              {/* Status input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted font-medium">Set Ticket Status</label>
                <select
                  className="w-full bg-[#111A2E]/80 border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                >
                  <option value="Pending" className="bg-deep text-white">Pending (Not Dispatched)</option>
                  <option value="In Progress" className="bg-deep text-white">In Progress (Engineering Allocated)</option>
                  <option value="Resolved" className="bg-deep text-white">Resolved (Issue rectified)</option>
                </select>
              </div>

              {/* Administrative Response */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted font-medium">Official Administrative Note Response</label>
                <textarea
                  className="w-full bg-[#111A2E]/80 border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                  rows="3"
                  required
                  placeholder="Describe details of the resolution e.g., 'Dispatched housekeeping team with hypoallergenic replacement pillows...'"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                ></textarea>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand hover:bg-brand-hover text-[#0A0E17] font-bold text-sm rounded-md transition-all duration-300 cursor-pointer disabled:opacity-50 border-none shadow-[0_10px_20px_rgba(225,173,36,0.2)] flex items-center justify-center gap-2"
              >
                <Send size={14} />
                {isSubmitting ? 'Updating Dispatch Ticket...' : 'Save Resolution Dispatch'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackControl;
