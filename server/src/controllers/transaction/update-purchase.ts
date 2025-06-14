import { Request, Response } from "express";
import { Types } from "mongoose";
import { Purchase } from "../../models/PurchaseTransaction";

const updatePurchase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;

    const {
      transactionName,
      participants,
      currency,
      exchangeRate,
      amount,
      amountInSgd,
      notes,
      date,
      paidBy,
      splitMethod,
      manualSplits,
      splitsInSgd,
    } = req.body;

    const toObjectId = (id: string | Types.ObjectId) =>
      id instanceof Types.ObjectId ? id : new Types.ObjectId(id);

    const participantsObjIds = participants.map(toObjectId);
    const paidByObjId = toObjectId(paidBy);

    const manualSplitsObj = (manualSplits ?? []).map(
      ({ user, amount }: { user: string; amount: number }) => ({
        user: toObjectId(user),
        amount,
      })
    );

    const splitsInSgdObj = (splitsInSgd ?? []).map(
      ({ user, amount }: { user: string; amount: number }) => ({
        user: toObjectId(user),
        amount,
      })
    );

    const updatedPurchase = await Purchase.findByIdAndUpdate(
      transactionId,
      {
        transactionName,
        participants: participantsObjIds,
        currency,
        exchangeRate,
        amount,
        amountInSgd,
        notes,
        date,
        paidBy: paidByObjId,
        splitMethod,
        manualSplits: manualSplitsObj,
        splitsInSgd: splitsInSgdObj,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPurchase) {
      res.status(404).json({ error: "Purchase not found" });
      return;
    }

    res.status(200).json(updatedPurchase);
  } catch (err) {
    console.error("Error updating purchase:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default updatePurchase;
