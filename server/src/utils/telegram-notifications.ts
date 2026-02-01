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
  participants: (string | Types.ObjectId)[],
  splits: Split[],
  currency: string,
  amount: number,
  specificUserIdsToNotify?: string[]
): Promise<void> {
  try {
    const payer = await User.findById(paidBy).lean();
    if (!payer) return;
    const paidByName = payer.displayName || payer.username;
    const paidByUsername = payer.username;

    // Get unique set of user IDs to notify (participants + payer)
    // Note: Set automatically handles duplicates if payer is in participants
    let userIdsToNotify = new Set([
      ...participants.map((p) => p.toString()),
      paidBy.toString(),
    ]);

    if (specificUserIdsToNotify && specificUserIdsToNotify.length > 0) {
      // If specific users are requested, filter the full set to only those users
      const specificSet = new Set(specificUserIdsToNotify);
      userIdsToNotify = new Set(
        [...userIdsToNotify].filter((id) => specificSet.has(id))
      );
    }

    for (const userId of userIdsToNotify) {
      const user = await User.findById(userId).lean();
      if (!user || !user.hasSignedUp || !user.telegramId) {
        continue;
      }

      const chatId = Number(user.telegramId);

      // Find if this user has a split portion
      const userSplit = splits.find(s => s.user.toString() === userId);
      const userShare = userSplit ? Number(userSplit.amount) : 0;

      const isPayer = String(user._id) === String(payer._id);

      const parts = [
        "🧾 *New Transaction*",
        "",
        `🛒 *${mdEscape(transactionName)}* paid by *${mdEscape(paidByName)}* \\(@${mdEscape(paidByUsername || "")}\\)`,
        "",
      ];

      if (currency !== "SGD") {
        parts.push(`💰 Total: *${mdEscape(currency)} ${mdEscape(amount.toFixed(2))}*`);
      } else {
        parts.push(`💰 Total: *SGD ${mdEscape(amount.toFixed(2))}*`);
      }

      parts.push("");

      if (userShare > 0 && !isPayer) {
        parts.push(`💸 Your Share: *SGD ${mdEscape(userShare.toFixed(2))}*`);
      } else if (isPayer) {
        parts.push(`✅ You paid for this`);
      } else {
        parts.push(`ℹ️ You are a participant`);
      }

      parts.push("");
      parts.push("You can view this transaction in the nest app\\.");

      const message = parts.join("\n");

      try {
        await bot.sendMessage(chatId, message, {
          parse_mode: "MarkdownV2",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔍 View Transaction",
                  web_app: {
                    url: `${process.env.CLIENT_URL}/history/${transactionId}`,
                  },
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
    console.error("Notification error:", err);
  }
}

export async function notifyTransactionUpdated(
  transactionId: string,
  transactionName: string,
  participants: (string | Types.ObjectId)[],
  editorId: string | Types.ObjectId,
  currency: string,
  amount: number
): Promise<void> {
  try {
    const editor = await User.findById(editorId).lean();
    const editorName = editor ? (editor.displayName || editor.username) : "Someone";
    const editorUsername = editor ? editor.username : "";

    // Get unique set of user IDs to notify
    const userIdsToNotify = new Set([
      ...participants.map((p) => p.toString()),
      editorId.toString(), // Ensure editor is included
    ]);

    for (const userId of userIdsToNotify) {
      const user = await User.findById(userId).lean();
      if (!user || !user.hasSignedUp || !user.telegramId) {
        continue;
      }

      const chatId = Number(user.telegramId);

      const parts = [
        "📝 *Transaction Updated*",
        "",
        `🛒 *${mdEscape(transactionName)}* edited by *${mdEscape(editorName || "Unknown")}* \\(@${mdEscape(editorUsername || "")}\\)`,
        "",
      ];

      if (currency !== "SGD") {
        parts.push(`💰 Total: *${mdEscape(currency)} ${mdEscape(amount.toFixed(2))}*`);
      } else {
        parts.push(`💰 Total: *SGD ${mdEscape(amount.toFixed(2))}*`);
      }

      parts.push("");
      parts.push("You can view the latest changes in the nest app\\.");

      const message = parts.join("\n");

      try {
        await bot.sendMessage(chatId, message, {
          parse_mode: "MarkdownV2",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔍 View Transaction",
                  web_app: {
                    url: `${process.env.CLIENT_URL}/history/${transactionId}`,
                  },
                },
              ],
            ],
          },
        });
      } catch (err) {
        console.error(`Failed to notify ${user.username} of update:`, err);
      }
    }
  } catch (err) {
    console.error("Update notification error:", err);
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
                  web_app: {
                    url: `${process.env.CLIENT_URL}/history/${transactionId}`,
                  },
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

export async function notifyTransactionCreated(
  transactionId: string,
  userId: string | Types.ObjectId,
  transactionName: string,
  amount: number,
  currency: string,
  amountInSgd: number
): Promise<void> {
  try {
    const user = await User.findById(userId).lean();
    if (!user || !user.telegramId) return;

    const chatId = Number(user.telegramId);
    const escapedName = mdEscape(transactionName);
    const escapedAmount = mdEscape(amount.toFixed(2));
    const escapedCurrency = mdEscape(currency);

    let amountDisplay = `*💸 ${escapedCurrency} ${escapedAmount}*`;

    if (currency.toUpperCase() !== "SGD") {
      const escapedSgdAmount = mdEscape(amountInSgd.toFixed(2));
      amountDisplay += ` \\(SGD ${escapedSgdAmount}\\)`;
    }

    const message = [
      "📧 *New Transaction*",
      "",
      `*🛒 ${escapedName}*`,
      "",
      amountDisplay,
      "",
      "Transaction created from your forwarded bank email\\.",
    ].join("\n");

    await bot.sendMessage(chatId, message, {
      parse_mode: "MarkdownV2",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🔍 View Transaction",
              web_app: {
                url: `${process.env.CLIENT_URL}/history/${transactionId}`,
              },
            },
          ],
        ],
      },
    });
  } catch (err) {
    console.error("Failed to notify user of email transaction:", err);
  }
}

export async function sendTelegramMessage(
  userId: string | Types.ObjectId,
  text: string
): Promise<void> {
  try {
    const user = await User.findById(userId).lean();
    if (!user || !user.telegramId) return;

    const chatId = Number(user.telegramId);
    // Send as plain text (no markdown parsing) to avoid errors with special chars in codes
    await bot.sendMessage(chatId, text);
  } catch (err) {
    console.error("Failed to send generic telegram message:", err);
  }
}
