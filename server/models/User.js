import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true, maxlength: 100 },
  roomNumber: { type: Number, min: 101, max: 483 },
  email: {
    type: String,
    required() { return this.role === 'admin'; },
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    maxlength: 254
  },
  passwordHash: {
    type: String,
    required() { return this.role === 'admin'; },
    select: false
  },
  role: { type: String, enum: ['guest', 'admin'], default: 'guest', immutable: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
