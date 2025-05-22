interface BaseTransaction {
  _id: string;
  transactionName: string;
  type: "purchase" | "bill" | "settleup" | "recurring";
  participants: string[];
  currency: string;
  exchangeRate: number;
  amount: number;
  amountInSgd: number;
  notes?: string;
  date: string;
}

export interface Split {
  user: string;
  amount: number;
}

export interface PurchaseTransaction extends BaseTransaction {
  type: "purchase";
  paidBy: string;
  splitMethod: "even" | "manual";
  manualSplits: Split[];
  splitsInSgd: Split[];
}

export interface BillItem {
  name: string;
  price: number;
  sharedBy: string[];
}

export interface BillTransaction extends BaseTransaction {
  type: "bill";
  paidBy: string;
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

  splitsInSgd: Split[];
}

export interface SettleUpTransaction extends BaseTransaction {
  type: "settleup";
  payer: string;
  payee: string;
}

export interface RecurringTransaction extends BaseTransaction {
  type: "recurring";
  paidBy: string;
  splitsInSgd: Split[];
  templateId: string;
}

export type Transaction =
  | PurchaseTransaction
  | BillTransaction
  | SettleUpTransaction
  | RecurringTransaction;
