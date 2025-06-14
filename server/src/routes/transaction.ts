import { Router } from "express";
import createPurchase from "../controllers/transaction/create-purchase";
import updatePurchase from "../controllers/transaction/update-purchase";
import createSettleUp from "../controllers/transaction/create-settleup";
import updateSettleUp from "../controllers/transaction/update-settleup";
import createBill from "../controllers/transaction/create-bill";
import updateBill from "../controllers/transaction/update-bill";
import getBalances from "../controllers/transaction/get-balance";
import getUserTransactions from "../controllers/transaction/get-transactions-for-user";
import getTransactionsBetweenUsers from "../controllers/transaction/get-transactions-for-userpair";
import deleteTransaction from "../controllers/transaction/delete-transaction";
import createRecurringTemplate from "../controllers/transaction/create-recurring-template";
import getUserRecurringTemplates from "../controllers/transaction/get-recurring-templates-for-user";
import deleteTemplate from "../controllers/transaction/delete-recurring-template";
import updateRecurringTemplate from "../controllers/transaction/update-recurring-template";

const router = Router();

router.post("/purchase/create", createPurchase);
router.put("/purchase/update/:transactionId", updatePurchase);
router.post("/settleup/create", createSettleUp);
router.put("/settleup/update/:transactionId", updateSettleUp);
router.post("/bill/create", createBill);
router.put("/bill/update/:transactionId", updateBill);
router.post("/recurring/create", createRecurringTemplate);
router.get("/balances/:userId", getBalances);
router.get("/all/:userId", getUserTransactions);
router.get("/recurring/:userId", getUserRecurringTemplates);
router.get("/all/:userId1/:userId2", getTransactionsBetweenUsers);
router.delete("/:transactionId", deleteTransaction);
router.delete("/recurring/:templateId", deleteTemplate);
router.put("/recurring/update/:templateId", updateRecurringTemplate);

export default router;
