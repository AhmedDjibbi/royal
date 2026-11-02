import mongoose from 'mongoose';

const roomNightSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  night: { type: String, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true }
}, { timestamps: true });

roomNightSchema.index({ roomId: 1, night: 1 }, { unique: true });
roomNightSchema.index({ bookingId: 1 });

const RoomNight = mongoose.model('RoomNight', roomNightSchema);
export default RoomNight;
