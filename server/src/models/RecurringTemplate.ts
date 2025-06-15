import mongoose from "mongoose";
import { Schema } from "mongoose";

const RecurringTemplateSchema = new mongoose.Schema({
  transactionName: { type: String, required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  notes: String,

  frequency: {
    type: String,
    enum: ["daily", "weekly", "monthly", "yearly"],
    required: true,
  },
  nextDate: { type: Date, required: true },

  splitsInSgd: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      amount: { type: Number, required: true },
    },
  ],
});

export const RecurringTemplate = mongoose.model(
  "RecurringTemplate",
  RecurringTemplateSchema
);
