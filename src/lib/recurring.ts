export interface RecurringSplit {
  user: string;
  amount: number;
  _id: string;
}

export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurringTemplate {
  _id: string;
  transactionName: string;
  participants: string[];
  paidBy: string;
  amount: number;
  notes?: string;
  frequency: RecurringFrequency;
  nextDate: string;
  splitsInSgd: RecurringSplit[];
}
