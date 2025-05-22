import { Request, Response } from "express";
import { RecurringTemplate } from "../../models/RecurringTemplate";
import generateIfDue from "./generate-recurring-if-due";

const cronRecurring = async (_req: Request, res: Response): Promise<void> => {
  try {
    const dueTemplates = await RecurringTemplate.find({
      nextDate: { $lte: new Date() },
    });

    for (const tpl of dueTemplates) {
      await generateIfDue(tpl);
    }
    res.sendStatus(204); // success, no body
  } catch (err) {
    console.error("Cron job failed:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default cronRecurring;
