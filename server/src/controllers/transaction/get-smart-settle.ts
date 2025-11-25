import { Request, Response } from "express";
import { Types } from "mongoose";
import { Transaction } from "../../models/Transaction";
import { User } from "../../models/User";

interface FlowRow {
  from: Types.ObjectId;
  to: Types.ObjectId;
  amount: number;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

const getSmartSettle = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUserId = req.auth?.id?.toString();
    const { participants } = req.body as { participants?: string[] };

    if (!authUserId) {
      res.status(403).json({ error: "Unauthorised" });
      return;
    }

    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      res.status(400).json({ error: "At least two participants are required" });
      return;
    }

    const uniqueParticipantIds = Array.from(new Set(participants));

    if (!uniqueParticipantIds.includes(authUserId)) {
      res
        .status(403)
        .json({ error: "Requesting user must be part of the settlement group" });
      return;
    }

    if (uniqueParticipantIds.some((id) => !Types.ObjectId.isValid(id))) {
      res.status(400).json({ error: "Invalid participant ID" });
      return;
    }

    const participantObjIds = uniqueParticipantIds.map((id) => new Types.ObjectId(id));

    const participantDocs = await User.find({ _id: { $in: participantObjIds } }).select(
      "_id username displayName profilePhoto"
    );

    if (participantDocs.length !== participantObjIds.length) {
      res.status(404).json({ error: "One or more participants not found" });
      return;
    }

    const participantSet = new Set(uniqueParticipantIds);

    const flowRows: FlowRow[] = await Transaction.aggregate([
      {
        $match: {
          $or: [
            { participants: { $in: participantObjIds } },
            { payer: { $in: participantObjIds } },
            { payee: { $in: participantObjIds } },
          ],
        },
      },
      {
        $facet: {
          purchaseBill: [
            { $match: { type: { $in: ["purchase", "bill", "recurring"] } } },
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
        },
      },
      { $project: { rows: { $concatArrays: ["$purchaseBill", "$settleup"] } } },
      { $unwind: "$rows" },
      { $replaceRoot: { newRoot: "$rows" } },
      {
        $match: {
          from: { $in: participantObjIds },
          to: { $in: participantObjIds },
        },
      },
      {
        $project: {
          _id: 0,
          from: 1,
          to: 1,
          amount: 1,
        },
      },
    ]);

    const balances = new Map<string, number>();
    participantSet.forEach((id) => balances.set(id, 0));

    flowRows.forEach(({ from, to, amount }) => {
      const fromId = from.toString();
      const toId = to.toString();

      if (!participantSet.has(fromId) || !participantSet.has(toId)) {
        return;
      }

      balances.set(fromId, round2((balances.get(fromId) ?? 0) + amount));
      balances.set(toId, round2((balances.get(toId) ?? 0) - amount));
    });

    const creditors: Array<{ id: string; amount: number }> = [];
    const debtors: Array<{ id: string; amount: number }> = [];

    balances.forEach((amount, id) => {
      if (amount > 0.009) {
        creditors.push({ id, amount });
      } else if (amount < -0.009) {
        debtors.push({ id, amount: Math.abs(amount) });
      }
    });

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const settlements: Array<{ from: string; to: string; amount: number }> = [];

    let creditorIdx = 0;
    let debtorIdx = 0;

    while (creditorIdx < creditors.length && debtorIdx < debtors.length) {
      const creditor = creditors[creditorIdx];
      const debtor = debtors[debtorIdx];

      const transferAmount = round2(Math.min(creditor.amount, debtor.amount));

      if (transferAmount > 0) {
        settlements.push({
          from: debtor.id,
          to: creditor.id,
          amount: transferAmount,
        });

        creditor.amount = round2(creditor.amount - transferAmount);
        debtor.amount = round2(debtor.amount - transferAmount);
      }

      if (creditor.amount <= 0.009) {
        creditorIdx += 1;
      }

      if (debtor.amount <= 0.009) {
        debtorIdx += 1;
      }
    }

    const userInfoMap = new Map(
      participantDocs.map((p) => [p._id.toString(), p.toObject({ getters: true })])
    );

    res.status(200).json({
      participants: uniqueParticipantIds,
      balances: uniqueParticipantIds.map((id) => ({
        userId: id,
        amount: round2(balances.get(id) ?? 0),
      })),
      settlements: settlements.map((s) => ({
        ...s,
        fromUser: userInfoMap.get(s.from),
        toUser: userInfoMap.get(s.to),
      })),
    });
  } catch (err) {
    console.error("Error calculating smart settle recommendations:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default getSmartSettle;