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
});

export const User = mongoose.model("User", UserSchema);
