import { Request, Response } from "express";
import { Types } from "mongoose";
import { SettleUp } from "../../models/SettleUpTransaction";

const createSettleUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currency, exchangeRate, amount, amountInSgd, notes, payer, payee } =
      req.body;

    // Helper to safely convert string to ObjectId
    const toObjectId = (id: string | Types.ObjectId) =>
      id instanceof Types.ObjectId ? id : new Types.ObjectId(id);

    const currentUser = req.auth?.id;
    const payerId = toObjectId(payer);
    const payeeId = toObjectId(payee);

    const participantsSet = new Set<string>([
      payerId.toString(),
      payeeId.toString(),
    ]);
    if (currentUser) {
      participantsSet.add(toObjectId(currentUser).toString());
    }
    const participants = Array.from(participantsSet).map(
      (id) => new Types.ObjectId(id)
    );

    const newSettleUp = await SettleUp.create({
      /* ---------- fields from BaseTransaction ---------- */
      transactionName: "Settle Up",
      type: "settleup",
      participants,
      currency,
      exchangeRate,
      amount,
      amountInSgd,
      notes,
      /* ---------- fields specific to Purchase ---------- */
      payer: payerId,
      payee: payeeId,
    });

    res.status(201).json(newSettleUp);
  } catch (err) {
    console.error("Error creating settle up transaction:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default createSettleUp;
