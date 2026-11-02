import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'A booking must be associated with a room']
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  status: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed', index: true },
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  guestsCount: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: 1
  },
  addons: {
    type: [String],
    default: []
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total price is required'],
    min: 0
  }
}, {
  timestamps: true
});

bookingSchema.index({ roomId: 1, status: 1, checkIn: 1, checkOut: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
