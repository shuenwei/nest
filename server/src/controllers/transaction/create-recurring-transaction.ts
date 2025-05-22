import { Request, Response } from "express";
import { Types } from "mongoose";
import { RecurringTemplate } from "../../models/RecurringTemplate";
import { Recurring } from "../../models/RecurringTransaction";

const createRecurringTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { templateId, date = new Date() } = req.body;

    if (!Types.ObjectId.isValid(templateId)) {
      res.status(400).json({ error: "Invalid templateId" });
      return;
    }

    const tpl = await RecurringTemplate.findById(templateId);
    if (!tpl) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    const tx = await Recurring.create({
      /* ---------- fields from BaseTransaction ---------- */
      type: "recurring",
      transactionName: tpl.transactionName,
      participants: tpl.participants,
      currency: "SGD",
      exchangeRate: 1,
      amount: tpl.amount,
      amountInSgd: tpl.amount,
      notes: tpl.notes,
      date,
      /* ---------- fields specific to Recurring ---------- */
      paidBy: tpl.paidBy,
      splitsInSgd: tpl.splitsInSgd,
      templateId: tpl._id,
    });

    res.status(201).json(tx);
    return;
  } catch (err) {
    console.error("Error creating recurring transaction:", err);
    res.status(500).json({ error: "Server error" });
    return;
  }
};

export default createRecurringTransaction;
