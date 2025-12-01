import mongoose, { Schema, Document, model } from "mongoose";
export interface IExchangeRate extends Document {
  currency: string;
  rate: number;
  updatedAt: Date;
}
const ExchangeRateSchema = new Schema<IExchangeRate>(
  {
    currency: { type: String, required: true, unique: true },
    rate: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);
export const ExchangeRate = model<IExchangeRate>("ExchangeRate", ExchangeRateSchema);