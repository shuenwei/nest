import { Request, Response } from "express";
import { Types } from "mongoose";
import { Transaction } from "../../models/Transaction";
import { SettleUp } from "../../models/SettleUpTransaction";

interface FlowRow {
  from: Types.ObjectId;
  to: Types.ObjectId;
  amount: number;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

const MIN_AMOUNT = 0.009;

const createSmartSettle = async (req: Request, res: Response): Promise<void> => {
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

    const participantSet = new Set(uniqueParticipantIds);
    const participantObjIds = uniqueParticipantIds.map((id) => new Types.ObjectId(id));

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

    const pairwiseNet = new Map<
      string,
      { first: string; second: string; net: number }
    >();

    flowRows.forEach(({ from, to, amount }) => {
      const fromId = from.toString();
      const toId = to.toString();

      if (!participantSet.has(fromId) || !participantSet.has(toId)) {
        return;
      }

      if (fromId === toId) {
        return;
      }

      const [first, second] = [fromId, toId].sort();
      const key = `${first}_${second}`;
      const signedAmount = fromId === first ? amount : -amount;

      const current = pairwiseNet.get(key)?.net ?? 0;
      pairwiseNet.set(key, { first, second, net: round2(current + signedAmount) });
    });

    const adjustmentSettlements: Array<{ payer: string; payee: string; amount: number }> = [];

    pairwiseNet.forEach(({ first, second, net }) => {
      if (Math.abs(net) <= MIN_AMOUNT) {
        return;
      }

      if (net > 0) {
        // second owes first
        adjustmentSettlements.push({ payer: second, payee: first, amount: net });
      } else {
        // first owes second
        adjustmentSettlements.push({ payer: first, payee: second, amount: Math.abs(net) });
      }
    });

    const creditors: Array<{ id: string; amount: number }> = [];
    const debtors: Array<{ id: string; amount: number }> = [];

    balances.forEach((amount, id) => {
      if (amount > MIN_AMOUNT) {
        creditors.push({ id, amount });
      } else if (amount < -MIN_AMOUNT) {
        debtors.push({ id, amount: Math.abs(amount) });
      }
    });

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const smartSettlements: Array<{ from: string; to: string; amount: number }> = [];

    let creditorIdx = 0;
    let debtorIdx = 0;

    while (creditorIdx < creditors.length && debtorIdx < debtors.length) {
      const creditor = creditors[creditorIdx];
      const debtor = debtors[debtorIdx];

      const transferAmount = round2(Math.min(creditor.amount, debtor.amount));

      if (transferAmount > 0) {
        smartSettlements.push({
          from: debtor.id,
          to: creditor.id,
          amount: transferAmount,
        });

        creditor.amount = round2(creditor.amount - transferAmount);
        debtor.amount = round2(debtor.amount - transferAmount);
      }

      if (creditor.amount <= MIN_AMOUNT) {
        creditorIdx += 1;
      }

      if (debtor.amount <= MIN_AMOUNT) {
        debtorIdx += 1;
      }
    }

    const adjustmentTransactions = await Promise.all(
      adjustmentSettlements.map(({ payer, payee, amount }) =>
        SettleUp.create({
          transactionName: "Adjustments for smart settle",
          type: "settleup",
          participants: [
            new Types.ObjectId(payer),
            new Types.ObjectId(payee),
          ],
          currency: "SGD",
          exchangeRate: 1,
          amount,
          amountInSgd: amount,
          payer: new Types.ObjectId(payer),
          payee: new Types.ObjectId(payee),
        })
      )
    );

    const smartSettleTransactions = await Promise.all(
      smartSettlements.map(({ from, to, amount }) =>
        SettleUp.create({
          transactionName: "Smart Settle",
          type: "settleup",
          participants: [new Types.ObjectId(from), new Types.ObjectId(to)],
          currency: "SGD",
          exchangeRate: 1,
          amount: -amount,
          amountInSgd: -amount,
          payer: new Types.ObjectId(from),
          payee: new Types.ObjectId(to),
        })
      )
    );

    res.status(201).json({
      adjustments: adjustmentTransactions,
      smartSettles: smartSettleTransactions,
    });
  } catch (err) {
    console.error("Error creating smart settle transactions:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default createSmartSettle;