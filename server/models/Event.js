import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Type classification (Event or Activity) is required'],
    enum: ['Event', 'Activity']
  },
  category: {
    type: String,
    default: 'General' // 'Thalassotherapy & Wellness', 'Marine Excursions', etc.
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  date: {
    type: String, // "2026-06-15" or "Daily", "Mon/Wed/Fri"
    required: true
  },
  time: {
    type: String, // "20:00 - Midnight", "09:00 - 20:00"
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Registration price is required'],
    min: 0
  },
  capacity: {
    type: Number,
    required: [true, 'Event occupancy capacity is required'],
    min: 1
  },
  registered: {
    type: [String],
    default: []
  },
  registrations: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    guestName: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now }
  }],
  image: {
    type: String,
    required: [true, 'Illustration image URL is required']
  }
}, {
  timestamps: true
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
