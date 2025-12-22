import mongoose from "mongoose";
import { RecurringTemplate } from "../../models/RecurringTemplate";
import { Recurring } from "../../models/RecurringTransaction";
import { addDays, addWeeks, addMonths, addYears, isBefore } from "date-fns";
import { notifySplits } from "../../utils/telegram-notifications";
import { BalanceService } from "../../services/balance-service";

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

  let newRecurringId: string | undefined;

  await mongoose.connection.transaction(async (session) => {
    const [newRecurring] = await Recurring.create(
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

    // Update balances atomically within the same session
    await BalanceService.handleTransactionChange(null, newRecurring, session);

    newRecurringId = newRecurring._id.toString();

    template.nextDate = advance(template.nextDate, template.frequency);
    await template.save({ session });
  });

  if (newRecurringId && template.splitsInSgd.length > 0) {
    await notifySplits(
      newRecurringId,
      template.transactionName,
      template.paidBy,
      template.splitsInSgd
    );
  }
};

export default generateIfDue;
