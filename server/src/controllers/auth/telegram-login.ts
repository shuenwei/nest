import { Request, Response } from "express";
import crypto from "crypto";
import axios from "axios";
import { User } from "../../models/User";
import jwt from "../../utils/jwt";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const telegramLogin = async (req: Request, res: Response): Promise<void> => {
  const { initData } = req.body as { initData?: string };

  if (!TELEGRAM_BOT_TOKEN) {
    res.status(500).json({ error: "Telegram bot token not configured" });
    return;
  }

  if (!initData) {
    res.status(400).json({ error: "Missing initData" });
    return;
  }

  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(TELEGRAM_BOT_TOKEN)
    .digest();
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (!receivedHash || calculatedHash !== receivedHash) {
    res.status(401).json({ error: "Invalid init data" });
    return;
  }

  const userPayload = params.get("user");

  if (!userPayload) {
    res.status(400).json({ error: "Missing user payload" });
    return;
  }

  let telegramUser: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  };

  try {
    telegramUser = JSON.parse(userPayload);
  } catch (err) {
    res.status(400).json({ error: "Invalid user payload" });
    return;
  }

  if (!telegramUser.username) {
    res
      .status(400)
      .json({ error: "A Telegram username is required to use this app" });
    return;
  }

  const telegramId = telegramUser.id.toString();
  const username = telegramUser.username.toLowerCase();
  const displayName = `${telegramUser.first_name ?? ""} ${
    telegramUser.last_name ?? ""
  }`
    .trim()
    .replace(/\s+/g, " ");

  try {
    const existingUser = await User.findOne({
      $or: [{ telegramId }, { username }],
    });

    const updateData: Record<string, unknown> = {
      telegramId,
      username,
      hasSignedUp: true,
      verifiedAt: new Date(),
    };

    if (!existingUser?.displayName && displayName) {
      updateData.displayName = displayName;
    }

    if (telegramUser.photo_url) {
      try {
        const response = await axios.get<ArrayBuffer>(
          telegramUser.photo_url,
          {
            responseType: "arraybuffer",
          }
        );

        const contentType = response.headers["content-type"];
        const photoBuffer = Buffer.from(response.data);
        if (
          contentType?.toLowerCase().startsWith("image/jpeg") &&
          photoBuffer.length > 0
        ) {
          updateData.profilePhoto = photoBuffer;
        }
      } catch (photoError) {
        console.error("Failed to fetch Telegram profile photo:", photoError);
      }
    }

    const userDoc = await User.findOneAndUpdate(
      {
        $or: [{ telegramId }, { username }],
      },
      updateData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const token = jwt.signToken(
      { id: userDoc._id, telegramId: userDoc.telegramId },
      "14d"
    );

    res.status(200).json({
      token,
      telegramId: userDoc.telegramId,
      hasSignedUp: userDoc.hasSignedUp,
      userId: userDoc._id,
    });
  } catch (error) {
    console.error("Telegram login failed:", error);
    res.status(500).json({ error: "Failed to authenticate user" });
  }
};

export default telegramLogin;