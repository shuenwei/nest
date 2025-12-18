import { Router } from "express";
import createTransactionFromEmail from "../controllers/transaction/create-transaction-from-email";

const router = Router();

// /webhook/email
router.post("/email", createTransactionFromEmail);

export default router;
