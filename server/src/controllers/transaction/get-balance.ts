import { Request, Response } from "express";
import { Types } from "mongoose";
import { User } from "../../models/User";
import { Transaction } from "../../models/Transaction";
import { Balance } from "../../models/Balance";

const getBalances = async (req: Request, res: Response): Promise<void> => {
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
      /* ── 2. Load user + friends ──────────────────────────────────────── */
      const user = await User.findById(userId).select("friends");

      if (!user) {
        res.status(404).json({ error: "User not found" });
      } else {
        const friendIds: Types.ObjectId[] = user.friends ?? [];

        /* ── 3. Fetch Balances from Cache ──────────────────────────────── */
        // We only need to find documents where user == userId
        const balanceDocs = await Balance.find({ user: userId });

        const balanceMap = new Map<string, number>();
        balanceDocs.forEach((b) =>
          balanceMap.set(b.friend.toString(), b.amount)
        );

        /* ── 4. Build Response ─────────────────────────────────────────── */
        const balances = friendIds.map((fid) => ({
          friendId: fid.toString(),
          amount: balanceMap.get(fid.toString()) ?? 0,
        }));

        res.status(200).json({ userId, balances });
      }
    }
  } catch (err) {
    console.error("Error calculating balances:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default getBalances;
