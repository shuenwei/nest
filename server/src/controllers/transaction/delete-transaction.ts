import { Request, Response } from "express";
import { Types } from "mongoose";
import { Transaction } from "../../models/Transaction";

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

    // Attempt to delete the transaction
    const deletedTransaction = await Transaction.findByIdAndDelete(
      transactionId
    );

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
