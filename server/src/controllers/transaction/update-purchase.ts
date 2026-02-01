import { Request, Response } from "express";
import { Types } from "mongoose";
import { Purchase } from "../../models/PurchaseTransaction";
import { BalanceService } from "../../services/balance-service";
import {
  notifyTransactionUpdated,
  notifySplits,
} from "../../utils/telegram-notifications";

const updatePurchase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;

    const authUserId = req.auth?.id?.toString();
    const existingPurchase = await Purchase.findById(transactionId);
    if (!existingPurchase) {
      res.status(404).json({ error: "Purchase not found" });
      return;
    }
    const isParticipant = existingPurchase.participants
      .map((id: Types.ObjectId) => id.toString())
      .includes(authUserId);
    if (!isParticipant) {
      res.status(403).json({ error: "Unauthorised" });
      return;
    }

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

    if (req.body.categoryIds) {
      const categoryIds = req.body.categoryIds.map(toObjectId);
      const userCategoryIndex = updatedPurchase!.userCategories!.findIndex(
        (uc: { userId: Types.ObjectId }) => uc.userId.toString() === authUserId
      );

      if (userCategoryIndex > -1) {
        updatedPurchase!.userCategories![userCategoryIndex].categoryIds =
          categoryIds;
      } else {
        updatedPurchase!.userCategories!.push({
          userId: new Types.ObjectId(authUserId),
          categoryIds,
        });
      }
      await updatedPurchase!.save();
    }

    await BalanceService.handleTransactionChange(existingPurchase, updatedPurchase);

    /* ---------- Notification Logic ---------- */
    const existingParticipantIds = existingPurchase.participants.map(
      (id: Types.ObjectId) => id.toString()
    );
    const updatedParticipantIds = updatedPurchase!.participants.map(
      (id: Types.ObjectId) => id.toString()
    );

    // 1. Identify participants who were already in the purchase (intersection)
    const continuingParticipantIds = updatedParticipantIds.filter((id: string) =>
      existingParticipantIds.includes(id)
    );

    // 2. Identify NEW participants (in updated but not in existing)
    const newParticipantIds = updatedParticipantIds.filter(
      (id: string) => !existingParticipantIds.includes(id)
    );

    // Check if critical details (amount or splits) changed
    const hasAmountChanged =
      Math.abs(existingPurchase.amount - updatedPurchase!.amount) > 0.001;

    const hasSplitsChanged = (() => {
      const oldSplits = existingPurchase.splitsInSgd || [];
      const newSplits = updatedPurchase!.splitsInSgd || [];
      if (oldSplits.length !== newSplits.length) return true;

      const oldMap = new Map(
        oldSplits.map((s: { user: Types.ObjectId; amount: number }) => [
          s.user.toString(),
          Number(s.amount),
        ])
      );

      for (const split of newSplits) {
        const oldAmount = oldMap.get(split.user.toString());
        if (typeof oldAmount !== "number") {
          return true;
        }
        if (Math.abs(oldAmount - Number(split.amount)) > 0.001) {
          return true;
        }
      }
      return false;
    })();

    // Notify existing users ONLY if the update affects them financially
    if (continuingParticipantIds.length > 0 && (hasAmountChanged || hasSplitsChanged)) {
      await notifyTransactionUpdated(
        transactionId,
        transactionName,
        continuingParticipantIds,
        authUserId!,
        currency,
        amount
      );
    }

    // Notify NEW users as if it's a new transaction for them
    if (newParticipantIds.length > 0) {
      await notifySplits(
        updatedPurchase!.id,
        transactionName,
        updatedPurchase!.paidBy,
        updatedPurchase!.participants,
        splitsInSgdObj, // This uses the updated splits
        currency,
        amount,
        newParticipantIds // Specific list solely for new people
      );
    }

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
