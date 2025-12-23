import { Request, Response } from "express";
import { Types } from "mongoose";
import { Bill } from "../../models/BillTransaction";
import { BalanceService } from "../../services/balance-service";

const updateBill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;

    const authUserId = req.auth?.id?.toString();
    const existingBill = await Bill.findById(transactionId);
    if (!existingBill) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }
    const isParticipant = existingBill.participants
      .map((id: Types.ObjectId) => id.toString())
      .includes(authUserId);
    if (!isParticipant) {
      res.status(403).json({ error: "Unauthorised" });
      return;
    }

    const {
      /* ---------- BaseTransaction fields ---------- */
      transactionName,
      participants,
      currency,
      exchangeRate,
      amount,
      amountInSgd,
      notes,
      date,

      /* ---------- Bill-specific fields ---------- */
      paidBy,
      items,
      discount,
      discountInSGD,
      discountType,
      discountValue,
      gst,
      gstPercentage,
      gstAmount,
      gstAmountInSgd,
      serviceCharge,
      serviceChargePercentage,
      serviceChargeAmount,
      serviceChargeAmountInSgd,
      subtotal,
      subtotalInSgd,
      splitsInSgd,
    } = req.body;

    const toObjectId = (id: string | Types.ObjectId) =>
      id instanceof Types.ObjectId ? id : new Types.ObjectId(id);

    const participantsObjIds = (participants ?? []).map(toObjectId);
    const paidByObjId = toObjectId(paidBy);

    const itemsObj = (items ?? []).map(
      ({
        name,
        price,
        sharedBy,
      }: {
        name: string;
        price: number;
        sharedBy: string[];
      }) => ({
        name,
        price,
        sharedBy: sharedBy.map(toObjectId),
      })
    );

    const splitsInSgdObj = (splitsInSgd ?? []).map(
      ({ user, amount }: { user: string; amount: number }) => ({
        user: toObjectId(user),
        amount,
      })
    );

    const updatedBill = await Bill.findByIdAndUpdate(
      transactionId,
      {
        /* ---------- BaseTransaction ---------- */
        transactionName,
        type: "bill",
        participants: participantsObjIds,
        currency,
        exchangeRate,
        amount,
        amountInSgd,
        notes,
        date,

        /* ---------- Bill-specific ---------- */
        paidBy: paidByObjId,
        items: itemsObj,

        discount,
        discountInSGD,
        discountType,
        discountValue,

        gst,
        gstPercentage,
        gstAmount,
        gstAmountInSgd,

        serviceCharge,
        serviceChargePercentage,
        serviceChargeAmount,
        serviceChargeAmountInSgd,

        subtotal,
        subtotalInSgd,

        splitsInSgd: splitsInSgdObj,
      },
      { new: true, runValidators: true }
    );

    if (req.body.categoryIds) {
      const categoryIds = req.body.categoryIds.map(toObjectId);
      const userCategoryIndex = updatedBill!.userCategories!.findIndex(
        (uc: { userId: Types.ObjectId }) => uc.userId.toString() === authUserId
      );

      if (userCategoryIndex > -1) {
        updatedBill!.userCategories![userCategoryIndex].categoryIds = categoryIds;
      } else {
        updatedBill!.userCategories!.push({
          userId: new Types.ObjectId(authUserId),
          categoryIds,
        });
      }
      await updatedBill!.save();
    }

    await BalanceService.handleTransactionChange(existingBill, updatedBill);

    if (!updatedBill) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }

    res.status(200).json(updatedBill);
  } catch (err) {
    console.error("Error updating bill:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default updateBill;
