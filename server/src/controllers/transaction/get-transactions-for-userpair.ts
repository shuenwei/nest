import { Request, Response } from "express";
import { Types } from "mongoose";
import { Transaction } from "../../models/Transaction";

const getTransactionsBetweenUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId1, userId2 } = req.params;

    const authUserId = req.auth?.id?.toString();
    if (!authUserId || (authUserId !== userId1 && authUserId !== userId2)) {
      res.status(403).json({ error: "Unauthorised" });
      return;
    }

    // ── 1. Validate IDs ───────────────────────────────────────────────
    if (!Types.ObjectId.isValid(userId1) || !Types.ObjectId.isValid(userId2)) {
      res.status(400).json({ error: "Invalid user IDs" });
      return;
    }

    const userObjId1 = new Types.ObjectId(userId1);
    const userObjId2 = new Types.ObjectId(userId2);

    // ── 2. Build match condition ──────────────────────────────────────
    const matchCondition = {
      participants: { $all: [userObjId1, userObjId2] },
    };

    // ── 3. Fetch transactions ─────────────────────────────────────────
    const transactions = await Transaction.find(matchCondition).sort({
      date: -1,
    }); // most recent first

    // ── 4. Return result ──────────────────────────────────────────────
    res.status(200).json(transactions);
  } catch (err) {
    console.error("Error getting transactions between users:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default getTransactionsBetweenUsers;
