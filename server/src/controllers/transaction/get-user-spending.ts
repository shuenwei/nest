import { Request, Response } from "express";
import { Types } from "mongoose";
import { Transaction } from "../../models/Transaction";
import { User } from "../../models/User";

const getUserSpending = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

    let start: Date | undefined;
    let end: Date | undefined;
    if (startDate) {
      const parsed = new Date(startDate);
      if (Number.isNaN(parsed.getTime())) {
        res.status(400).json({ error: "Invalid startDate" });
        return;
      }
      start = parsed;
    }

    if (endDate) {
      const parsed = new Date(endDate);
      if (Number.isNaN(parsed.getTime())) {
        res.status(400).json({ error: "Invalid endDate" });
        return;
      }
      end = parsed;
    }

    if (!Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userObjId = new Types.ObjectId(userId);

    const matchStage: Record<string, unknown> = { participants: userObjId };
    if (start || end) {
      matchStage.date = {};
      if (start)
        Object.assign(matchStage.date as Record<string, Date>, { $gte: start });
      if (end)
        Object.assign(matchStage.date as Record<string, Date>, { $lte: end });
    }

    const [result] = await Transaction.aggregate([
      { $match: matchStage },
      { $unwind: "$splitsInSgd" },
      { $match: { "splitsInSgd.user": userObjId } },
      {
        $group: {
          _id: null,
          total: { $sum: "$splitsInSgd.amount" },
        },
      },
      { $project: { _id: 0, totalSpent: { $round: ["$total", 2] } } },
    ]);

    const totalSpent = result?.totalSpent ?? 0;
    res.status(200).json({ userId, totalSpent });
  } catch (err) {
    console.error("Error calculating user spending:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default getUserSpending;
