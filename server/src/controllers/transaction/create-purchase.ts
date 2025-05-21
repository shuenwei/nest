import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Purchase } from '../../models/PurchaseTransaction';

const createPurchase = async (req: Request, res: Response): Promise<void> => {
  try {
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

    /* Convert any string IDs into ObjectId instances  ---------------------- */
    const toObjectId = (id: string | Types.ObjectId) =>
      id instanceof Types.ObjectId ? id : new Types.ObjectId(id);

    const participantsObjIds = participants.map(toObjectId);
    const paidByObjId = toObjectId(paidBy);

    const manualSplitsObj = (manualSplits ?? []).map(
      ({ user, amount }: { user: string; amount: number }) => ({
        user: toObjectId(user),
        amount,
      }),
    );

    const splitsInSgdObj = (splitsInSgd ?? []).map(
      ({ user, amount }: { user: string; amount: number }) => ({
        user: toObjectId(user),
        amount,
      }),
    );

    const newPurchase = await Purchase.create({
      /* ---------- fields from BaseTransaction ---------- */
      transactionName,
      type: 'purchase',
      participants: participantsObjIds,
      currency,
      exchangeRate,
      amount,
      amountInSgd,
      notes,
      date,
      /* ---------- fields specific to Purchase ---------- */
      paidBy: paidByObjId,
      splitMethod,
      manualSplits: manualSplitsObj,
      splitsInSgd: splitsInSgdObj,
    });

    res.status(201).json(newPurchase);
  } catch (err) {
    console.error('Error creating purchase:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export default createPurchase;
