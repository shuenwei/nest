import { Request, Response } from "express";
import { Types } from "mongoose";
import { SettleUp } from "../../models/SettleUpTransaction";
import { BalanceService } from "../../services/balance-service";

const updateSettleUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;

    const authUserId = req.auth?.id?.toString();
    const existingSettleUp = await SettleUp.findById(transactionId);
    if (!existingSettleUp) {
      res.status(404).json({ error: "Settle up transaction not found" });
      return;
    }

    const isParticipant = existingSettleUp.participants
      .map((id: Types.ObjectId) => id.toString())
      .includes(authUserId);
    if (!isParticipant) {
      res.status(403).json({ error: "Unauthorised" });
      return;
    }

    const { currency, exchangeRate, amount, amountInSgd, notes, payer, payee } =
      req.body;

    const toObjectId = (id: string | Types.ObjectId) =>
      id instanceof Types.ObjectId ? id : new Types.ObjectId(id);

    const payerId = toObjectId(payer);
    const payeeId = toObjectId(payee);

    const participants = [payerId, payeeId];

    const updatedSettleUp = await SettleUp.findByIdAndUpdate(
      transactionId,
      {
        transactionName: "Settle Up",
        type: "settleup",
        participants,
        currency,
        exchangeRate,
        amount,
        amountInSgd,
        notes,
        payer: payerId,
        payee: payeeId,
      },
      { new: true, runValidators: true }
    );

    await BalanceService.handleTransactionChange(existingSettleUp, updatedSettleUp);

    if (!updatedSettleUp) {
      res.status(404).json({ error: "Settle up transaction not found" });
      return;
    }

    res.status(200).json(updatedSettleUp);
  } catch (err) {
    console.error("Error updating settle up transaction:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default updateSettleUp;
