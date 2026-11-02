import mongoose from 'mongoose';

const reclamationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true
  },
  roomNumber: {
    type: String,
    required: [true, 'Room or suite number is required']
  },
  category: {
    type: String,
    required: [true, 'Complaint category is required'],
    enum: ['Maintenance', 'Housekeeping', 'Rooms', 'Dining', 'Other']
  },
  urgency: {
    type: String,
    required: [true, 'Urgency priority is required'],
    enum: ['Low', 'Medium', 'High']
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required']
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'In Progress', 'Resolved']
  },
  response: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Reclamation = mongoose.model('Reclamation', reclamationSchema);
export default Reclamation;
