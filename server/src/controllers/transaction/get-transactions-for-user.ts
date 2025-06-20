import { Request, Response } from "express";
import { Types } from "mongoose";
import { Transaction } from "../../models/Transaction";
import { User } from "../../models/User";

const getUserTransactions = async (
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
        const transactions = await Transaction.find({
          participants: userObjId,
        }).sort({ date: -1 }); // most recent first

        /* ── 4. Auto add new participants as friends ──────────────────── */
        const participantIds = new Set<string>();
        transactions.forEach((t) =>
          t.participants.forEach((p) => participantIds.add(p.toString()))
        );

        const existingFriendIds = new Set(
          (user.friends ?? []).map((f) => f.toString())
        );
        const newFriendIds = Array.from(participantIds).filter(
          (id) => id !== userId && !existingFriendIds.has(id)
        );

        if (newFriendIds.length > 0) {
          const newFriendObjIds = newFriendIds.map(
            (id) => new Types.ObjectId(id)
          );
          await User.updateOne(
            { _id: userObjId },
            { $addToSet: { friends: { $each: newFriendObjIds } } }
          );
          await User.updateMany(
            { _id: { $in: newFriendObjIds } },
            { $addToSet: { friends: userObjId } }
          );
        }

        /* ── 5. Send final response ────────────────────────────────────── */
        res.status(200).json({ userId, transactions });
      }
    }
  } catch (err) {
    console.error("Error fetching user transactions:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default getUserTransactions;
