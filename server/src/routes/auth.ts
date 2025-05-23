import express from "express";
import sendVerificationCode from "../controllers/auth/send-code";
import verifyVerificationCode from "../controllers/auth/verify-code";
import verifyToken from "../controllers/auth/verify-token";

// initialize router
const router = express.Router();

router.post("/sendcode/:username", sendVerificationCode);

router.post("/verifycode", verifyVerificationCode);

router.get("/verifytoken", verifyToken);

export default router;
