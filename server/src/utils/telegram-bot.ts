import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import otp from "./otp";
import { User } from "../models/User";
import { processReceipt } from "./azureDocumentIntelligence";
import dotenv from "dotenv";
import { MONTHLY_SCAN_LIMIT } from "../constants";
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
    bot.sendMessage(chatId, "❌ Invalid request.");
    return;
  }

  if (telegramUser.username.toLowerCase() !== usernameFromLink?.toLowerCase()) {
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
    const lowercaseUsername = usernameFromLink.toLowerCase();
    const code = otp.generate(lowercaseUsername);

    const existingUser = await User.findOne({
      $or: [
        { telegramId: telegramUser.id.toString() },
        { username: telegramUser.username.toLowerCase() },
      ],
    });

    if (!existingUser?.hasSignedUp) {
      bot.sendMessage(
        chatId,
        `🕘 Please wait while we fetch your OTP code...`,
        {
          parse_mode: "Markdown",
        }
      );
    } else {
      // Send OTP
      bot.sendMessage(
        chatId,
        `✅ Your OTP is: \`${code}\`\n\nYou can tap on the code to copy to clipboard\\. It expires in 2 minutes\\.`,
        {
          parse_mode: "MarkdownV2",
        }
      );
    }

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

    const updateData: any = {
      telegramId: telegramUser.id.toString(),
      username: telegramUser.username.toLowerCase(),
      profilePhoto: profilePhotoBuffer,
      verifiedAt: new Date(),
      hasSignedUp: true,
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
          { username: telegramUser.username.toLowerCase() },
        ],
      },
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (!existingUser?.hasSignedUp) {
      // Send OTP
      bot.sendMessage(
        chatId,
        `✅ Your OTP is: \`${code}\`\n\nYou can tap on the code to copy to clipboard\\. It expires in 2 minutes\\.`,
        {
          parse_mode: "MarkdownV2",
        }
      );
    }
  } catch (error) {
    console.error("Telegram bot error:", error);
    bot.sendMessage(chatId, "⚠️ Something went wrong. Please try again later.");
  }
});

bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;
  const photoArray = msg.photo;
  const telegramUser = msg.from;

  const checkUser = await User.findOne({
    telegramId: telegramUser?.id.toString(),
  });

  if (!checkUser) {
    bot.sendMessage(
      chatId,
      "⛔️ You are not authorised to use the bill scanning function."
    );
    return;
  }

  if (!photoArray || photoArray.length === 0) {
    bot.sendMessage(
      chatId,
      "❌ No image found. Please send a photo of the receipt."
    );
    return;
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  let usage = checkUser.monthlyUsage;
  if (!usage || usage.month !== currentMonth) {
    usage = { month: currentMonth, scans: 0, translations: 0 };
  }
  const scanLimit = checkUser.limits?.scans ?? MONTHLY_SCAN_LIMIT;
  if (usage.scans >= scanLimit) {
    bot.sendMessage(chatId, "❌ You have reached your monthly scan limit.");
    return;
  }

  usage.scans += 1;
  checkUser.monthlyUsage = usage;
  await checkUser.save();

  const processingMsg = await bot.sendMessage(
    chatId,
    "🧾 Processing receipt, please wait..."
  );

  try {
    const fileId = photoArray[photoArray.length - 1].file_id;
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    const { restaurantName, items } = await processReceipt(fileUrl);

    await bot.deleteMessage(chatId, processingMsg.message_id);

    if (!restaurantName || items.length === 0) {
      bot.sendMessage(
        chatId,
        `⚠️ Unable to extract receipt details. Try again with a clearer image.`
      );
      return;
    }

    // Construct query params
    const params = new URLSearchParams();
    params.append("rName", restaurantName);
    items.forEach((item) => {
      params.append("n", item.name);
      params.append("p", item.price);
    });

    const fullUrl = `https://nest.shuenwei.dev/splitbill?${params.toString()}`;

    bot.sendMessage(
      chatId,
      `✅ Your *${restaurantName}* receipt has been processed!`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Split this bill on the app", url: fullUrl }],
          ],
        },
      }
    );
  } catch (err) {
    console.error(err);
    bot.sendMessage(
      chatId,
      "⚠️ Something went wrong while processing the receipt."
    );
  }
});

export default bot;
