import mongoose from 'mongoose';

const tableBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  date: {
    type: String, // "YYYY-MM-DD"
    required: true
  },
  time: {
    type: String, // "19:00", "20:00", etc.
    required: true
  },
  guestName: {
    type: String,
    required: true
  },
  partySize: {
    type: Number,
    required: true
  }
});

const tableSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  bookedSlots: [tableBookingSchema]
});

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    unique: true
  },
  cuisine: {
    type: String,
    required: [true, 'Cuisine style is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  image: {
    type: String,
    required: [true, 'Image URL is required']
  },
  tables: [tableSchema]
}, {
  timestamps: true
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
