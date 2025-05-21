import { Schema } from 'mongoose';
import { Transaction } from './Transaction';

export interface SettleUpTransaction {
  payer: Schema.Types.ObjectId;
  payee: Schema.Types.ObjectId;
}

const SettleUpTransactionSchema = new Schema<SettleUpTransaction>({
  payer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  payee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export const SettleUp = Transaction.discriminator('settleup', SettleUpTransactionSchema);
