import { Request, Response } from "express";
import { RecurringTemplate } from "../../models/RecurringTemplate";
import generateIfDue from "./generate-recurring-if-due";

const updateRecurringTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { templateId } = req.params;

    const updatedTemplate = await RecurringTemplate.findByIdAndUpdate(
      templateId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTemplate) {
      res.status(404).json({ error: "Recurring template not found" });
      return;
    }

    await generateIfDue(updatedTemplate);

    res.status(200).json(updatedTemplate);
  } catch (err) {
    console.error("Error updating recurring template:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default updateRecurringTemplate;
