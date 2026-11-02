import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Star rating is required'],
    min: [1, 'Minimum rating is 1'],
    max: [5, 'Maximum rating is 5']
  },
  category: {
    type: String,
    required: [true, 'Feedback category is required'],
    enum: ['Service', 'Dining', 'Rooms', 'Overall']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required']
  },
  approved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
