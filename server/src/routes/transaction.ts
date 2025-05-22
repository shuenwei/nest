import { Router } from "express";
import createPurchase from "../controllers/transaction/create-purchase";
import createSettleUp from "../controllers/transaction/create-settleup";
import createBill from "../controllers/transaction/create-bill";
import getBalances from "../controllers/transaction/get-balance";
import getUserTransactions from "../controllers/transaction/get-transactions-for-user";
import getTransactionsBetweenUsers from "../controllers/transaction/get-transactions-for-userpair";
import deleteTransaction from "../controllers/transaction/delete-transaction";

const router = Router();

router.post("/purchase/create", createPurchase);
router.post("/settleup/create", createSettleUp);
router.post("/bill/create", createBill);
router.get("/balances/:userId", getBalances);
router.get("/all/:userId", getUserTransactions);
router.get("/all/:userId1/:userId2", getTransactionsBetweenUsers);
router.delete("/:transactionId", deleteTransaction);

export default router;
