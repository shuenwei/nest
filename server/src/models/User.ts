import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  telegramId: { type: String, unique: true },
  username: { type: String, required: true, unique: true },
  displayName: { type: String },
  profilePhoto: { type: Buffer },
  verifiedAt: { type: Date, default: Date.now },
  hasSignedUp: {
    type: Boolean,
    default: false,
  },
});

export const User = mongoose.model('User', UserSchema);
