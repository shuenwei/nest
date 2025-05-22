import { Request, Response } from "express";
import { RecurringTemplate } from "../../models/RecurringTemplate";
import generateIfDue from "./generate-recurring-if-due";

const createRecurringTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // body already validated by zod / yup / joi in middleware, ideally
    const template = await RecurringTemplate.create(req.body);

    // immediately create a Recurring transaction if nextDate ≤ today
    await generateIfDue(template);

    res.status(201).json(template);
  } catch (err) {
    console.error("Error creating recurring template:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default createRecurringTemplate;
