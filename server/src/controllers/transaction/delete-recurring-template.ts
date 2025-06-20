import { Request, Response } from "express";
import { Types } from "mongoose";
import { RecurringTemplate } from "../../models/RecurringTemplate";

const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;

    // Validate the ObjectId
    if (!Types.ObjectId.isValid(templateId)) {
      res.status(400).json({ error: "Invalid template ID" });
      return;
    }

    const authUserId = req.auth?.id?.toString();
    const existingTemplate = await RecurringTemplate.findById(
      templateId
    ).select("participants");
    if (!existingTemplate) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    const isParticipant = existingTemplate.participants
      .map((id) => id.toString())
      .includes(authUserId);
    if (!isParticipant) {
      res.status(403).json({ error: "Unauthorised" });
      return;
    }

    // Attempt to delete the transaction
    const deletedTemplate = await RecurringTemplate.findByIdAndDelete(
      templateId
    );

    if (!deletedTemplate) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    res.status(200).json({ message: "Template deleted successfully" });
  } catch (err) {
    console.error("Error deleting template:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default deleteTemplate;
