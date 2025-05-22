import { Schema } from "mongoose";
import { Transaction } from "./Transaction";

export interface RecurringSplit {
  user: Schema.Types.ObjectId;
  amount: number;
}

export interface RecurringTransaction {
  paidBy: Schema.Types.ObjectId;
  splitsInSgd: RecurringSplit[];
  templateId: Schema.Types.ObjectId;
}

const RecurringTransactionSchema = new Schema<RecurringTransaction>({
  paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  splitsInSgd: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      amount: { type: Number, required: true },
    },
  ],
  templateId: {
    type: Schema.Types.ObjectId,
    ref: "RecurringTemplate",
    required: true,
  },
});

export const Recurring = Transaction.discriminator(
  "recurring",
  RecurringTransactionSchema
);
