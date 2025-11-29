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
    const { lastUpdatedAt, knownTransactionIds } = req.query;
    const normalizedLastUpdatedAt = Array.isArray(lastUpdatedAt)
      ? lastUpdatedAt[0]
      : lastUpdatedAt;
    const normalizedKnownTransactionIds = Array.isArray(knownTransactionIds)
      ? knownTransactionIds.join(",")
      : knownTransactionIds;

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

        /* ── 3. Determine differential fetch parameters ────────────────── */
        let lastUpdatedDate: Date | undefined;
        if (
          typeof normalizedLastUpdatedAt === "string" &&
          normalizedLastUpdatedAt.trim()
        ) {
          const parsed = new Date(normalizedLastUpdatedAt);
          if (Number.isNaN(parsed.getTime())) {
            res.status(400).json({ error: "Invalid lastUpdatedAt" });
            return;
          }
          lastUpdatedDate = parsed;
        }

        /* ── 4. Fetch only new or updated transactions ─────────────────── */
        const query = lastUpdatedDate
          ? {
              participants: userObjId,
              $or: [
                { updatedAt: { $gt: lastUpdatedDate } },
                {
                  updatedAt: { $exists: false },
                  createdAt: { $gt: lastUpdatedDate },
                },
                {
                  updatedAt: { $exists: false },
                  createdAt: { $exists: false },
                  date: { $gt: lastUpdatedDate },
                },
              ],
            }
          : { participants: userObjId };

        const transactions = await Transaction.find(query).sort({ date: -1 }); // most recent first

        /* ── 5. Identify deleted transactions from client cache ────────── */
        let deletedTransactionIds: string[] = [];
        if (
          typeof normalizedKnownTransactionIds === "string" &&
          normalizedKnownTransactionIds
        ) {
          const localIds = normalizedKnownTransactionIds
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id && Types.ObjectId.isValid(id))
            .map((id) => new Types.ObjectId(id));

          if (localIds.length > 0) {
            const existing = await Transaction.find<{ _id: Types.ObjectId }>(
              {
                _id: { $in: localIds },
                participants: userObjId,
              }
            ).select("_id");

            const existingIdSet = new Set(existing.map((t) => t._id.toString()));
            deletedTransactionIds = localIds
              .map((id) => id.toString())
              .filter((id) => !existingIdSet.has(id));
          }
        }

        /* ── 6. Auto add new participants as friends ──────────────────── */
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

        /* ── 7. Send final response ────────────────────────────────────── */
        res.status(200).json({ userId, transactions, deletedTransactionIds });
      }
    }
  } catch (err) {
    console.error("Error fetching user transactions:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default getUserTransactions;
