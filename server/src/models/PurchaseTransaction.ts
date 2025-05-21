import { Schema } from 'mongoose';
import { Transaction } from './Transaction';

export interface PurchaseSplit {
  user: Schema.Types.ObjectId;
  amount: number;
}

export interface PurchaseTransaction {
  paidBy: Schema.Types.ObjectId;
  splitMethod: 'even' | 'manual';
  manualSplits: PurchaseSplit[];
  splitsInSgd: PurchaseSplit[];
}

const PurchaseTransactionSchema = new Schema<PurchaseTransaction>({
  paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  splitMethod: { type: String, enum: ['even', 'manual'], required: true },
  manualSplits: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      amount: { type: Number, required: true },
    },
  ],
  splitsInSgd: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      amount: { type: Number, required: true },
    },
  ],
});

export const Purchase = Transaction.discriminator('purchase', PurchaseTransactionSchema);
