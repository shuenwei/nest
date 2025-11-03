import express from "express";
import verifyVerificationCode from "../controllers/auth/verify-code";
import verifyToken from "../controllers/auth/verify-token";
import loginWithTelegram from "../controllers/auth/telegram-login";

// initialize router
const router = express.Router();

router.post("/verifycode", verifyVerificationCode);

router.post("/telegram", loginWithTelegram);

router.get("/verifytoken", verifyToken);

export default router;
