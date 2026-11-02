import { useState } from 'react';
import { CalendarDays, Clock3, Plus, Users } from 'lucide-react';
import { useHotel } from '../../context/HotelContext.jsx';

const initialForm = { name: '', type: 'Event', category: '', description: '', date: '', time: '', price: '0', capacity: '20', image: '/images/event_gala.jpg' };

const EventControl = () => {
  const { events, activities, addNewEvent } = useHotel();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await addNewEvent({ ...form, price: Number(form.price), capacity: Number(form.capacity) });
      setForm(initialForm);
      setMessage('Experience published successfully.');
    } catch (error) {
      setMessage(error.message || 'Could not publish this experience.');
    } finally { setSaving(false); }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-heading"><div><span className="intro-overline">RESORT PROGRAMMING</span><h1>Experiences & <em>events.</em></h1><p>Publish a new activity or a special moment on the resort calendar.</p></div></header>
      <div className="event-admin-layout">
        <form className="event-form" onSubmit={submit}>
          <h2><Plus size={18} /> Add an experience</h2>
          <label>Experience name<input required minLength="3" maxLength="100" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <div className="event-form-row">
            <label>Format<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, image: e.target.value === 'Event' ? '/images/event_gala.jpg' : '/images/activity_spa.jpg' })}><option>Event</option><option>Activity</option></select></label>
            <label>Category<input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Wellness, dining…" /></label>
          </div>
          <label>Description<textarea required minLength="10" maxLength="800" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="event-form-row">
            <label>Date<input required type="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
            <label>Time<input required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="18:00–20:00" /></label>
          </div>
          <div className="event-form-row">
            <label>Price per guest<input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
            <label>Capacity<input required type="number" min="1" max="1000" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></label>
          </div>
          <label>Image<select value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}><option value="/images/event_gala.jpg">Gala</option><option value="/images/event_summit.jpg">Summit</option><option value="/images/activity_spa.jpg">Spa</option><option value="/images/activity_sailing.jpg">Sailing</option><option value="/images/activity_yoga.jpg">Yoga</option></select></label>
          {message && <p className="admin-feedback-message" role="status">{message}</p>}
          <button type="submit" disabled={saving} className="event-publish">{saving ? 'Publishing…' : 'Publish to calendar'} <Plus size={15} /></button>
        </form>
        <section className="event-list-panel"><h2>Published calendar</h2>{[...events, ...activities].map((item) => <article className="event-admin-card" key={item._id || item.id}>
          <img src={item.image} alt="" /><div><span>{item.type} · {item.category}</span><h3>{item.name}</h3><p><CalendarDays size={13} />{item.date} <Clock3 size={13} />{item.time}</p><small><Users size={13} /> {item.registeredCount ?? item.registered?.length ?? 0} / {item.capacity} enrolled</small></div>
        </article>)}{!events.length && !activities.length && <p className="account-empty">No experiences published yet.</p>}</section>
      </div>
    </div>
  );
};

export default EventControl;
