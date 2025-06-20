import mongoose from "mongoose";

const VerificationCodeSchema = new mongoose.Schema({
  username: { type: String, required: true, lowercase: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // auto-delete after 5 minutes
});

export const VerificationCode = mongoose.model(
  "VerificationCode",
  VerificationCodeSchema
);
