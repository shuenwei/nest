import { Schema } from 'mongoose';
import { Transaction } from './Transaction';

export interface BillItem {
  name: string;
  price: number;
  sharedBy: Schema.Types.ObjectId[];
}

export interface BillSplit {
  user: Schema.Types.ObjectId;
  amount: number;
}

export interface BillTransaction {
  paidBy: Schema.Types.ObjectId;
  items: BillItem[];

  discount: number;
  discountInSGD: number;
  discountType: string;
  discountValue: number;
  
  gst: boolean;
  gstPercentage: number;
  gstAmount: number;
  gstAmountInSgd: number;

  serviceCharge: boolean;
  serviceChargePercentage: number;
  serviceChargeAmount: number;
  serviceChargeAmountInSgd: number;
  
  subtotal: number;
  subtotalInSgd: number;

  splitsInSgd: BillSplit[];
}

const BillTransactionSchema = new Schema<BillTransaction>({
  paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      sharedBy: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    },
  ],

  discount: Number,
  discountInSGD: Number,
  discountType: {
      type: String,
      enum: ["none", "amount", "percentage"],
      default: 'none',
    },
  discountValue: Number,

  gst: { type: Boolean, required: true },
  gstPercentage: Number,
  gstAmount: Number,
  gstAmountInSgd: Number,

  serviceCharge: { type: Boolean, required: true },
  serviceChargePercentage: Number,
  serviceChargeAmount: Number,
  serviceChargeAmountInSgd: Number,

  subtotal: Number,
  subtotalInSgd: Number,

  splitsInSgd: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      amount: { type: Number, required: true },
    },
  ],
});

export const Bill = Transaction.discriminator('bill', BillTransactionSchema);
