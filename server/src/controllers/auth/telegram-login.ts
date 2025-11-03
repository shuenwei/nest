import { Request, Response } from "express";
import crypto from "crypto";
import axios from "axios";
import { User } from "../../models/User";
import jwt from "../../utils/jwt";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is not defined in the environment.");
}

const secretKey = crypto
  .createHmac("sha256", "WebAppData")
  .update(TELEGRAM_BOT_TOKEN)
  .digest();

const verifyTelegramInitData = (initData: string) => {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get("hash");

  if (!hash) {
    return { valid: false } as const;
  }

  const dataCheckString = Array.from(urlParams.entries())
    .filter(([key]) => key !== "hash")
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) {
    return { valid: false } as const;
  }

  const userRaw = urlParams.get("user");

  if (!userRaw) {
    return { valid: false } as const;
  }

  try {
    const user = JSON.parse(userRaw) as {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
      photo_url?: string;
    };

    return { valid: true, user } as const;
  } catch (error) {
    console.error("Failed to parse Telegram user payload:", error);
    return { valid: false } as const;
  }
};

const loginWithTelegram = async (req: Request, res: Response): Promise<void> => {
  const { initData } = req.body as { initData?: string };

  if (!initData) {
    res.status(400).json({ error: "Missing initData" });
    return;
  }

  const verification = verifyTelegramInitData(initData);

  if (!verification.valid) {
    res.status(403).json({ error: "Invalid Telegram data" });
    return;
  }

  const telegramUser = verification.user;
  const telegramId = telegramUser.id?.toString();
  const username = telegramUser.username?.toLowerCase();

  if (!telegramId) {
    res.status(400).json({ error: "Telegram ID missing" });
    return;
  }

  if (!username) {
    res.status(400).json({
      error: "Telegram username is required to use this app",
    });
    return;
  }

  const displayName = `${telegramUser.first_name ?? ""} ${
    telegramUser.last_name ?? ""
  }`
    .trim()
    .replace(/\s+/g, " ");

  let user = await User.findOne({ telegramId });

  if (!user) {
    user = await User.findOne({ username });
  }

  let profilePhotoBuffer: Buffer | undefined;

  if (telegramUser.photo_url) {
    try {
      const response = await axios.get<ArrayBuffer>(telegramUser.photo_url, {
        responseType: "arraybuffer",
      });
      profilePhotoBuffer = Buffer.from(response.data);
    } catch (error) {
      console.error("Unable to download Telegram profile photo:", error);
    }
  }

  try {
    if (!user) {
      user = new User({
        telegramId,
        username,
        displayName: displayName || undefined,
        verifiedAt: new Date(),
        hasSignedUp: Boolean(displayName),
        friends: [],
        blockedUsers: [],
      });

      if (profilePhotoBuffer) {
        user.profilePhoto = profilePhotoBuffer;
      }

      await user.save();
    } else {
      user.telegramId = telegramId;
      user.username = username;

      if (!user.displayName && displayName) {
        user.displayName = displayName;
      }

      if (profilePhotoBuffer) {
        user.profilePhoto = profilePhotoBuffer;
      }

      user.hasSignedUp = Boolean(user.displayName);

      if (!user.verifiedAt) {
        user.verifiedAt = new Date();
      }

      await user.save();
    }

    const token = jwt.signToken(
      { id: user._id, telegramId: user.telegramId },
      "14d"
    );

    res.status(200).json({
      token,
      telegramId: user.telegramId,
      hasSignedUp: user.hasSignedUp,
    });
  } catch (error) {
    console.error("Error during Telegram login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default loginWithTelegram;
