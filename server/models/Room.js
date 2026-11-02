import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['Suite', 'Pavilion', 'Penthouse', 'Room']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Room price per night is required'],
    min: [0, 'Price cannot be negative']
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  image: {
    type: String,
    required: [true, 'Room image URL is required']
  },
  maxGuests: {
    type: Number,
    required: [true, 'Maximum guest capacity is required'],
    min: 1
  },
  features: {
    type: [String],
    default: []
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Room = mongoose.model('Room', roomSchema);
export default Room;
