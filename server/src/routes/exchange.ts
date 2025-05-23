import { Router } from "express";
import getExchangeRate from "../controllers/exchange/get-exchange-rate";

const router = Router();

router.get("/:currency", getExchangeRate);

export default router;
