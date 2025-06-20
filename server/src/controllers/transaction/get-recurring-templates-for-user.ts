import { Request, Response } from "express";
import { Types } from "mongoose";
import { RecurringTemplate } from "../../models/RecurringTemplate";
import { User } from "../../models/User";

const getUserRecurringTemplates = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const authUserId = req.auth?.id?.toString();
    if (!authUserId || authUserId !== userId) {
      res.status(403).json({ error: "Unauthorised" });
      return;
    }

    /* ── 1. Validate ID ─────────────────────────────────────────────────── */
    if (!Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid userId" });
    } else {
      /* ── 2. Load user to confirm existence ───────────────────────────── */
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
      } else {
        const userObjId = new Types.ObjectId(userId);

        /* ── 3. Fetch all related transactions ─────────────────────────── */
        const recurringTemplates = await RecurringTemplate.find({
          participants: userObjId,
        }).sort({ date: -1 }); // most recent first

        /* ── 4. Send final response ────────────────────────────────────── */
        res.status(200).json({ userId, recurringTemplates });
      }
    }
  } catch (err) {
    console.error("Error fetching user transactions:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default getUserRecurringTemplates;
