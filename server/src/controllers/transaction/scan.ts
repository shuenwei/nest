import { Request, Response } from "express";
import { processReceiptFromBuffer } from "../../utils/azureDocumentIntelligence";
import { MONTHLY_SCAN_LIMIT } from "../../constants";
import { User } from "../../models/User";

const scanReceipt = async (req: Request, res: Response): Promise<void> => {
  const { imageBase64 } = req.body as { imageBase64?: string };

  if (!imageBase64) {
    res.status(400).json({ error: "No image provided" });
    return;
  }

  try {
    const authUserId = req.auth?.id?.toString();
    const user = await User.findById(authUserId);
    if (!user) {
      res.status(403).json({ error: "Unauthorised" });
      return;
    }
    const currentMonth = new Date().toISOString().slice(0, 7);
    let usage = user.monthlyUsage;
    if (!usage || usage.month !== currentMonth) {
      usage = { month: currentMonth, scans: 0, translations: 0 };
    }
    const scanLimit = user.limits?.scans ?? MONTHLY_SCAN_LIMIT;
    if (usage.scans >= scanLimit) {
      res.status(429).json({ error: "Monthly scan limit reached" });
      return;
    }

    usage.scans += 1;
    user.monthlyUsage = usage;
    await user.save();

    const buffer = Buffer.from(imageBase64, "base64");
    const result = await processReceiptFromBuffer(buffer);
    res.json(result);
  } catch (err) {
    console.error("Receipt scanning failed:", err);
    res.status(500).json({ error: "Receipt scanning failed" });
  }
};

export default scanReceipt;
