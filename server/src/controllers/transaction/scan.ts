import { Request, Response } from "express";
import { processReceiptFromBuffer } from "../../utils/azureDocumentIntelligence";

const scanReceipt = async (req: Request, res: Response): Promise<void> => {
  const { imageBase64 } = req.body as { imageBase64?: string };

  if (!imageBase64) {
    res.status(400).json({ error: "No image provided" });
    return;
  }

  try {
    const buffer = Buffer.from(imageBase64, "base64");
    const result = await processReceiptFromBuffer(buffer);
    res.json(result);
  } catch (err) {
    console.error("Receipt scanning failed:", err);
    res.status(500).json({ error: "Receipt scanning failed" });
  }
};

export default scanReceipt;
