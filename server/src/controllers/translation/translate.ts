import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

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
