import mongoose from "mongoose";
import { RecurringTemplate } from "../../models/RecurringTemplate";
import { Recurring } from "../../models/RecurringTransaction";
import { addDays, addWeeks, addMonths, addYears, isBefore } from "date-fns";

/** Advance helper */
function advance(date: Date, freq: "daily" | "weekly" | "monthly" | "yearly") {
  switch (freq) {
    case "daily":
      return addDays(date, 1);
    case "weekly":
      return addWeeks(date, 1);
    case "monthly":
      return addMonths(date, 1);
    case "yearly":
    default:
      return addYears(date, 1);
  }
}

const generateIfDue = async (
  template: InstanceType<typeof RecurringTemplate>
): Promise<void> => {
  const now = new Date();
  if (!template.nextDate || template.nextDate > now) return; // nothing due

  await mongoose.connection.transaction(async (session) => {
    await Recurring.create(
      [
        {
          /* -------- base fields -------- */
          type: "recurring",
          transactionName: template.transactionName,
          participants: template.participants,
          currency: "SGD",
          exchangeRate: 1,
          amount: template.amount,
          amountInSgd: template.amount,
          notes: template.notes,
          date: template.nextDate,
          /* -------- recurring-specific -------- */
          paidBy: template.paidBy,
          splitsInSgd: template.splitsInSgd,
          templateId: template._id,
        },
      ],
      { session }
    );

    template.nextDate = advance(template.nextDate, template.frequency);
    await template.save({ session });
  });
};

export default generateIfDue;
