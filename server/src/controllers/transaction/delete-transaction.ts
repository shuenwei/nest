import { Request, Response } from "express";
import { Types } from "mongoose";
import { Transaction } from "../../models/Transaction";
import { BalanceService } from "../../services/balance-service";

const deleteTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { transactionId } = req.params;

    // Validate the ObjectId
    if (!Types.ObjectId.isValid(transactionId)) {
      res.status(400).json({ error: "Invalid transaction ID" });
      return;
    }

    const authUserId = req.auth?.id?.toString();
    const existingTransaction = await Transaction.findById(
      transactionId
    );
    if (!existingTransaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    const isParticipant = existingTransaction.participants
      .map((id) => id.toString())
      .includes(authUserId);
    if (!isParticipant) {
      res.status(403).json({ error: "Unauthorised" });
      return;
    }

    // Attempt to delete the transaction
    const deletedTransaction = await Transaction.findByIdAndDelete(
      transactionId
    );

    await BalanceService.handleTransactionChange(existingTransaction, null);

    if (!deletedTransaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default deleteTransaction;
