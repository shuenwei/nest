import mongoose, { Schema, Document, model } from 'mongoose';

export type TransactionType = 'purchase' | 'bill' | 'settleup';

export interface BaseTransaction extends Document {
    transactionName: string;
    type: TransactionType;
    participants: Schema.Types.ObjectId[];
    currency: string;
    exchangeRate: number;
    amount: number;
    amountInSgd: number;
    notes?: string;
    date: Date;
}

const baseOptions = {
    discriminatorKey: 'type',
    collection: 'transactions',
    timestamps: true,
};

const BaseTransactionSchema = new Schema<BaseTransaction>(
    {
        transactionName: String,
        type: { type: String, required: true },
        participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
        currency: { type: String, required: true },
        exchangeRate: { type: Number, required: true },
        amount: { type: Number, required: true },
        amountInSgd: { type: Number, required: true },
        notes: String,
        date: { type: Date, default: Date.now },
    },
    baseOptions
);

export const Transaction = model<BaseTransaction>('Transaction', BaseTransactionSchema);
