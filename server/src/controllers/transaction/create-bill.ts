import { Request, Response } from "express";
import { Types } from "mongoose";
import { Bill } from "../../models/BillTransaction";
import { notifySplits } from "../../utils/telegram-notifications";
import { BalanceService } from "../../services/balance-service";

const createBill = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      /* ---------- BaseTransaction fields ----------------------------------- */
      transactionName,
      participants,
      currency,
      exchangeRate,
      amount,
      amountInSgd,
      notes,
      date,

      /* ---------- Bill-specific fields ------------------------------------- */
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

    const newBill = await Bill.create({
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

      /* ---------- Bill-specific ----------- */
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
      userCategories: req.body.categoryIds
        ? [
          {
            userId: new Types.ObjectId(req.auth!.id),
            categoryIds: req.body.categoryIds.map(toObjectId),
          },
        ]
        : [],
    });

    await BalanceService.handleTransactionChange(null, newBill);

    if (splitsInSgdObj.length > 0 || participantsObjIds.length > 0) {
      await notifySplits(
        newBill._id.toString(),
        transactionName,
        paidByObjId,
        participantsObjIds,
        splitsInSgdObj,
        currency,
        amount
      );
    }

    res.status(201).json(newBill);
  } catch (err) {
    console.error("Error creating bill:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default createBill;
