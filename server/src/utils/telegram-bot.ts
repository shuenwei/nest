import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import { VerificationCode } from "../models/VerificationCode";
import { User } from "../models/User";
import dotenv from "dotenv";
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API_URL = process.env.API_URL!;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);
bot.setWebHook(`${API_URL}/telegram`);

bot.onText(/^\/start verify_(.+)$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const usernameFromLink = match?.[1];
  const telegramUser = msg.from;

  if (!usernameFromLink || !telegramUser?.username) {
    bot.sendMessage(
      chatId,
      "❌ Invalid request or Telegram username not found."
    );
    return;
  }

  if (telegramUser.username.toLowerCase() !== usernameFromLink.toLowerCase()) {
    bot.sendMessage(
      chatId,
      `❌ Oops! Did you enter the wrong username on the app?\n\nYour username is @${telegramUser.username} but you entered @${usernameFromLink}.`,
      {
        parse_mode: "Markdown",
      }
    );
    return;
  }

  try {
    const otpDoc = await VerificationCode.findOne({
      username: usernameFromLink,
    });

    if (!otpDoc) {
      bot.sendMessage(
        chatId,
        `❌ No verification code found.\n\nYour verification code might have expired.`,
        {
          parse_mode: "Markdown",
        }
      );
      return;
    }

    // Please wait message to fetch user details.
    bot.sendMessage(chatId, `🕘 Please wait...`, {
      parse_mode: "Markdown",
    });

    // Fetch profile photo and convert to buffer
    const photoData = await bot.getUserProfilePhotos(telegramUser.id, {
      limit: 1,
    });
    const fileId =
      photoData.total_count > 0 ? photoData.photos[0][0].file_id : null;

    let profilePhotoBuffer: Buffer | undefined = undefined;

    if (fileId) {
      const file = await bot.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file.file_path}`;
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });
      profilePhotoBuffer = Buffer.from(response.data);
    }

    // Save user info to MongoDB
    const existingUser = await User.findOne({
      $or: [
        { telegramId: telegramUser.id.toString() },
        { username: telegramUser.username },
      ],
    });

    const updateData: any = {
      telegramId: telegramUser.id.toString(),
      username: telegramUser.username,
      profilePhoto: profilePhotoBuffer,
      verifiedAt: new Date(),
    };

    // Only set displayName if not already defined
    if (!existingUser?.displayName) {
      updateData.displayName = `${telegramUser.first_name ?? ""} ${
        telegramUser.last_name ?? ""
      }`.trim();
    }

    // Find and update by telegramId or username, or create if not found
    await User.findOneAndUpdate(
      {
        $or: [
          { telegramId: telegramUser.id.toString() },
          { username: telegramUser.username },
        ],
      },
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send OTP
    bot.sendMessage(
      chatId,
      `✅ Your OTP code is: *${otpDoc.code}*\n\nIt expires in 5 minutes.`,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Telegram bot error:", error);
    bot.sendMessage(chatId, "⚠️ Something went wrong. Please try again later.");
  }
});

export default bot;
