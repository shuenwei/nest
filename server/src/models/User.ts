import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  telegramId: { type: String },
  username: { type: String, required: true, unique: true, lowercase: true },
  displayName: { type: String },
  profilePhoto: { type: Buffer },
  verifiedAt: { type: Date },
  hasSignedUp: {
    type: Boolean,
    default: false,
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  blockedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  monthlyUsage: {
    month: {
      type: String,
      default: () => new Date().toISOString().slice(0, 7),
    },
    scans: { type: Number, default: 0 },
    translations: { type: Number, default: 0 },
  },
  limits: {
    scans: { type: Number },
    translations: { type: Number },
  },
});

export const User = mongoose.model("User", UserSchema);
