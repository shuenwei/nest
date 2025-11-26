import { Request, Response } from "express";
import { Types } from "mongoose";
import { User } from "../../models/User";
import { Transaction } from "../../models/Transaction";

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
        const userObjId = new Types.ObjectId(userId);

        /* ── 3. Build aggregation pipeline ─────────────────────────────── */
        const pipeline = [
          /* 3-a  Only keep transactions that involve user or friends */
          {
            $match: {
              $or: [{ participants: { $in: [userObjId, ...friendIds] } }],
            },
          },

          /* 3-b  Normalise purchase/bill and settle-up rows */
          {
            $facet: {
              purchaseBill: [
                {
                  $match: { type: { $in: ["purchase", "bill", "recurring"] } },
                },
                { $unwind: "$splitsInSgd" },
                {
                  $project: {
                    from: "$paidBy",
                    to: "$splitsInSgd.user",
                    amount: "$splitsInSgd.amount",
                  },
                },
              ],
              settleup: [
                { $match: { type: "settleup" } },
                {
                  $project: {
                    from: "$payer",
                    to: "$payee",
                    amount: "$amountInSgd",
                  },
                },
              ],
              groupSmartSettle: [
                { $match: { type: "groupSmartSettle" } },
                { $unwind: "$transfers" },
                {
                  $project: {
                    from: "$transfers.payer",
                    to: "$transfers.payee",
                    amount: "$transfers.amount",
                  },
                },
              ],
            },
          },
          {
            $project: {
              rows: {
                $concatArrays: [
                  "$purchaseBill",
                  "$settleup",
                  "$groupSmartSettle",
                ],
              },
            },
          },
          { $unwind: "$rows" },
          { $replaceRoot: { newRoot: "$rows" } },

          /* 3-c  Keep rows where user is sender or receiver */
          { $match: { $or: [{ from: userObjId }, { to: userObjId }] } },

          /* 3-d  Tag friend + debit / credit */
          {
            $project: {
              friend: {
                $cond: [{ $eq: ["$from", userObjId] }, "$to", "$from"],
              },
              debit: {
                $cond: [{ $eq: ["$from", userObjId] }, "$amount", 0],
              },
              credit: {
                $cond: [{ $eq: ["$to", userObjId] }, "$amount", 0],
              },
            },
          },

          /* 3-e  Net per-friend balance */
          {
            $group: {
              _id: "$friend",
              totalDebit: { $sum: "$debit" },
              totalCredit: { $sum: "$credit" },
            },
          },
          {
            $project: {
              _id: 0,
              friendId: "$_id",
              amount: {
                $round: [{ $subtract: ["$totalDebit", "$totalCredit"] }, 2],
              },
            },
          },
        ];

        /* ── 4. Run aggregation & merge zeros ──────────────────────────── */
        const aggResult = await Transaction.aggregate(pipeline);

        const balanceMap = new Map<string, number>();
        aggResult.forEach((r) =>
          balanceMap.set(r.friendId.toString(), r.amount)
        );

        const balances = friendIds.map((fid) => ({
          friendId: fid.toString(),
          amount: balanceMap.get(fid.toString()) ?? 0,
        }));

        /* ── 5. Send final response ────────────────────────────────────── */
        res.status(200).json({ userId, balances });
      }
    }
  } catch (err) {
    console.error("Error calculating balances:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default getBalances;
