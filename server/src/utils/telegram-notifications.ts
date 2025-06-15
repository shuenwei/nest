import { Types } from "mongoose";
import { User } from "../models/User";
import bot from "./telegram-bot";
import dotenv from "dotenv";
dotenv.config();

interface Split {
  user: string | Types.ObjectId;
  amount: number;
}

const mdEscape = (text: string): string =>
  text.replace(/([_*\[\]()~`>#+\-=|{}\.!])/g, "\\$1");

export async function notifySplits(
  transactionId: string,
  transactionName: string,
  paidBy: string | Types.ObjectId,
  splits: Split[]
): Promise<void> {
  try {
    const payer = await User.findById(paidBy).lean();
    if (!payer) return;
    const paidByName = payer.displayName || payer.username;
    const paidByUsername = payer.username;

    for (const split of splits) {
      const splitUser = await User.findById(split.user).lean();
      if (!splitUser || !splitUser.hasSignedUp || !splitUser.telegramId) {
        continue;
      }
      if (String(splitUser._id) === String(payer._id)) {
        continue;
      }
      const chatId = Number(splitUser.telegramId);
      const amount = Number(split.amount).toFixed(2);
      const message = [
        "🧾 *New Transaction*",
        "",
        `🛒 *${mdEscape(transactionName)}* paid by *${mdEscape(
          paidByName
        )}* \\(\\@${mdEscape(paidByUsername)}\\)`,
        "",
        `💸 Your Share: *SGD ${mdEscape(amount)}*`,
        "",
        "You can view this transaction in the nest app\\.",
      ].join("\n");
      try {
        await bot.sendMessage(chatId, message, {
          parse_mode: "MarkdownV2",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔍 View Transaction",
                  url: `${process.env.CLIENT_URL}/history/${transactionId}`,
                },
              ],
            ],
          },
        });
      } catch (err) {
        console.error(`Failed to notify ${splitUser.username}:`, err);
      }
    }
  } catch (err) {
    console.error("Notification error:", err);
  }
}

export async function notifyTransfer(
  transactionId: string,
  payerId: string | Types.ObjectId,
  payeeId: string | Types.ObjectId,
  amountInSgd: number
): Promise<void> {
  try {
    const [payer, payee] = await Promise.all([
      User.findById(payerId).lean(),
      User.findById(payeeId).lean(),
    ]);

    if (!payer || !payee) return;

    const payerName = payer.displayName || payer.username;
    const payeeName = payee.displayName || payee.username;

    const escapedPayerName = mdEscape(payerName);
    const escapedPayeeName = mdEscape(payeeName);
    const escapedPayerUsername = mdEscape(payer.username);
    const escapedPayeeUsername = mdEscape(payee.username);
    const escapedAmount = mdEscape(Number(amountInSgd).toFixed(2));

    const message = [
      "💰 *New Transfer*",
      "",
      `*${escapedPayerName}* \\(@${escapedPayerUsername}\\) ➡️ *${escapedPayeeName}* \\(@${escapedPayeeUsername}\\)`,
      "",
      `💸 Amount: *SGD ${escapedAmount}*`,
      "",
      "You can view this transaction in the nest app\\.",
    ].join("\n");

    for (const user of [payer, payee]) {
      if (!user.hasSignedUp || !user.telegramId) continue;
      const chatId = Number(user.telegramId);
      try {
        await bot.sendMessage(chatId, message, {
          parse_mode: "MarkdownV2",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔍 View Transfer",
                  url: `${process.env.CLIENT_URL}/history/${transactionId}`,
                },
              ],
            ],
          },
        });
      } catch (err) {
        console.error(`Failed to notify ${user.username}:`, err);
      }
    }
  } catch (err) {
    console.error("Transfer notification error:", err);
  }
}
