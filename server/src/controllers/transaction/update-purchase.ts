import { Request, Response } from "express";
import { Types } from "mongoose";
import { Purchase } from "../../models/PurchaseTransaction";
import { BalanceService } from "../../services/balance-service";

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
