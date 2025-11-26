import { Schema } from "mongoose";
import { Transaction } from "./Transaction";

export type SmartSettleTransferCategory = "adjustment" | "settlement";

export interface SmartSettleTransfer {
  payer: Schema.Types.ObjectId;
  payee: Schema.Types.ObjectId;
  amount: number;
  category: SmartSettleTransferCategory;
}

export interface GroupSmartSettleTransaction {
  transfers: SmartSettleTransfer[];
}

const SmartSettleTransferSchema = new Schema<SmartSettleTransfer>({
  payer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  payee: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ["adjustment", "settlement"], required: true },
});

const GroupSmartSettleTransactionSchema = new Schema<GroupSmartSettleTransaction>({
  transfers: { type: [SmartSettleTransferSchema], default: [] },
});

export const GroupSmartSettle = Transaction.discriminator(
  "groupSmartSettle",
  GroupSmartSettleTransactionSchema
);