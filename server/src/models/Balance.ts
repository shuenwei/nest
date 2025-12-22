import mongoose, { Schema, Document, model } from "mongoose";

export interface IBalance extends Document {
    user: mongoose.Types.ObjectId;
    friend: mongoose.Types.ObjectId;
    amount: number;
}

const BalanceSchema = new Schema<IBalance>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        friend: { type: Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true, default: 0 },
    },
    {
        timestamps: true,
    }
);

/* 
  Compound index to quickly find the balance for a specific pair.
  We want to ensure there is only one document for "Alice -> Bob".
  Note: We intentionally store TWO documents per pair:
    1. { user: Alice, friend: Bob, amount: 50 }  (Alice sees she is owed 50)
    2. { user: Bob, friend: Alice, amount: -50 } (Bob sees he owes 50)
  This optimizes the "Get My Balances" query to be a simple .find({ user: me }).
*/
BalanceSchema.index({ user: 1, friend: 1 }, { unique: true });

export const Balance = model<IBalance>("Balance", BalanceSchema);
