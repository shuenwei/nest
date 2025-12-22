import { Request, Response } from "express";
import { Types } from "mongoose";
import { User } from "../../models/User";
import { Transaction } from "../../models/Transaction";
import { Balance } from "../../models/Balance";

const verifyBalance = async (req: Request, res: Response): Promise<void> => {
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
            return;
        }

        /* ── 2. Load user + friends ──────────────────────────────────────── */
        const user = await User.findById(userId).select("friends");
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const friendIds: Types.ObjectId[] = user.friends ?? [];
        const userObjId = new Types.ObjectId(userId);

        /* ── 3. Fetch Cached Balances ────────────────────────────────────── */
        const cachedDocs = await Balance.find({ user: userId });
        const cachedMap = new Map<string, number>();
        cachedDocs.forEach((b) => cachedMap.set(b.friend.toString(), b.amount));

        /* ── 4. Run Legacy Aggregation (Ground Truth) ────────────────────── */
        const pipeline = [
            {
                $match: {
                    $or: [{ participants: { $in: [userObjId, ...friendIds] } }],
                },
            },
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
            { $match: { $or: [{ from: userObjId }, { to: userObjId }] } },
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

        const aggResult = await Transaction.aggregate(pipeline);
        const legacyMap = new Map<string, number>();
        aggResult.forEach((r) => legacyMap.set(r.friendId.toString(), r.amount));

        /* ── 5. Compare ──────────────────────────────────────────────────── */
        const discrepancies: any[] = [];
        const allFriends = new Set([...cachedMap.keys(), ...legacyMap.keys()]);

        allFriends.forEach((fid) => {
            // Basic check: ignore if both are effectively 0 (or missing which implies 0)
            const cachedVal = cachedMap.get(fid) ?? 0;
            const legacyVal = legacyMap.get(fid) ?? 0;

            // Check difference with small epsilon for safety, though both should be rounded to 2 decimals
            if (Math.abs(cachedVal - legacyVal) > 0.005) {
                discrepancies.push({
                    friendId: fid,
                    cached: cachedVal,
                    legacy: legacyVal,
                    diff: cachedVal - legacyVal,
                });
            }
        });

        if (discrepancies.length > 0) {
            res.status(200).json({
                status: "DISCREPANCY_FOUND",
                message: "Cached balances do not match transaction history.",
                discrepancies,
            });
        } else {
            res.status(200).json({
                status: "MATCH",
                message: "Cached balances match transaction history exactly.",
            });
        }
    } catch (err) {
        console.error("Error verifying balances:", err);
        res.status(500).json({ error: "Server error" });
    }
};

export default verifyBalance;
