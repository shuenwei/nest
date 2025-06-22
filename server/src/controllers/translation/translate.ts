import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { MONTHLY_TRANSLATE_LIMIT } from "../../constants";
import { User } from "../../models/User";

dotenv.config();

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY!;

const translate = async (req: Request, res: Response): Promise<void> => {
  const { texts } = req.body as {
    texts?: string[];
  };

  if (!texts || texts.length === 0) {
    res.status(400).json({ error: "No texts provided" });
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
    const translateLimit = user.limits?.translations ?? MONTHLY_TRANSLATE_LIMIT;
    if (usage.translations >= translateLimit) {
      res.status(429).json({ error: "Monthly translation limit reached" });
      return;
    }

    usage.translations += 1;
    user.monthlyUsage = usage;
    await user.save();

    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      {
        q: texts,
        target: "en",
        format: "text",
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const translations =
      response.data?.data?.translations?.map((t: any) => t.translatedText) ||
      [];
    res.json({ translations });
  } catch (err) {
    console.error("Translation failed:", err);
    res.status(500).json({ error: "Translation failed" });
  }
};

export default translate;
