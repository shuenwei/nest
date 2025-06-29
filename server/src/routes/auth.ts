import express from "express";
import verifyVerificationCode from "../controllers/auth/verify-code";
import verifyToken from "../controllers/auth/verify-token";

// initialize router
const router = express.Router();

router.post("/verifycode", verifyVerificationCode);

router.get("/verifytoken", verifyToken);

export default router;
