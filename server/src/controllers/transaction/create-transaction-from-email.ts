import { Request, Response } from "express";
import { User } from "../../models/User";
import { Purchase } from "../../models/PurchaseTransaction";
import { parseEmailWithAI } from "../../utils/ai-parser";
import { getOrFetchExchangeRate } from "../../utils/currency";
import {
    notifySplits,
    notifyTransactionCreated,
    sendTelegramMessage,
} from "../../utils/telegram-notifications";

import { simpleParser } from "mailparser";

const createTransactionFromEmail = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { from, to, subject, rawEmail } = req.body;

        let emailBody = "";
        if (rawEmail) {
            try {
                const parsed = await simpleParser(rawEmail);
                // Prefer text, fall back to html, then raw
                emailBody = parsed.text || parsed.html || parsed.textAsHtml || rawEmail;
            } catch (pError) {
                console.warn("Mailparser failed, falling back to raw.", pError);
                emailBody = rawEmail;
            }
        }

        if (!from || !to || !emailBody) {
            console.warn("Invalid email payload:", req.body);
            res.status(400).json({ error: "Missing 'from', 'to', or 'rawEmail' fields" });
            return;
        }

        // Find User by ID from Subaddressing
        const targetEmail = to.toLowerCase();
        const localPart = targetEmail.split("@")[0];

        if (!localPart.startsWith("transaction+")) {
            console.warn(`Invalid local part format: ${localPart}`);
            res.status(400).json({ error: "Invalid email format. Expected transaction+<userId>@nest.shuenwei.dev" });
            return;
        }

        const userId = localPart.split("+")[1];

        if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
            console.warn(`Invalid UserID in email: ${userId}`);
            res.status(400).json({ error: "Invalid UserID format" });
            return;
        }

        const user = await User.findById(userId);

        if (!user) {
            console.warn(`No user found for ID: ${userId}`);
            res.status(404).json({ error: "User not found" });
            return;
        }

        // Handle Confirmation/Verification Emails
        const isVerification =
            (subject && (subject.includes("Forwarding Confirmation") || subject.includes("Verify your forwarding address") || subject.includes("confirm your email"))) ||
            (emailBody && (emailBody.includes("requested to automatically forward mail") || emailBody.includes("verification code")));

        if (isVerification) {
            console.log("Detected Verification Email");

            await sendTelegramMessage(
                user._id,
                `📧 Forwarding Verification Received\n\n${subject}\n\n${emailBody}`
            );
            res.status(200).json({ message: "Verification email forwarded to user" });
            return;
        }

        const parsedData = await parseEmailWithAI(emailBody);

        if (!parsedData) {
            console.warn("AI failed to parse transaction details");
            res.status(422).json({ error: "Could not parse transaction details" });
            return;
        }

        if (parsedData.type === "irrelevant") {
            const reason = parsedData.reason || "Unable to identify transaction";
            await sendTelegramMessage(
                user._id,
                `🚫 No transaction found in email\n\nReason: ${reason}\n\n${subject}\n\n${emailBody}`
            );
            res.status(200).json({ message: "Ignored irrelevant email", reason });
            return;
        }

        if (parsedData.type === "transfer") {
            await sendTelegramMessage(
                user._id,
                `🚫 You forwarded a PayNow/bank transfer email. This email type is not supported at this moment. If this was forwarded automatically, tune your email filter to only forward transaction emails. You can do so by specifying keywords for your email subject line in your filter.`
            );
            res.status(200).json({ message: "Transfer detected but not supported yet" });
            return;
        }

        if (parsedData.type === "purchase") {
            const { merchant, amount, currency, date } = parsedData;

            if (!amount) {
                console.warn("No amount found in purchase email");
                res.status(422).json({ error: "No amount found" });
                return;
            }

            let exchangeRate = 1;
            let amountInSgd = amount;

            if (currency && currency.toUpperCase() !== "SGD") {
                const fetchedRate = await getOrFetchExchangeRate(currency);
                if (fetchedRate) {
                    exchangeRate = fetchedRate;
                    amountInSgd = Number((amount / fetchedRate).toFixed(2));
                } else {
                    console.warn(`No exchange rate found (API failed) for ${currency}, defaulting to 1:1`);
                }
            }

            const newPurchase = await Purchase.create({
                transactionName: merchant || "Purchase created from email",
                type: "purchase",
                participants: [user._id],
                paidBy: user._id,
                currency: currency || "SGD",
                exchangeRate,
                amount,
                amountInSgd,
                notes: `${subject}\n\n${emailBody}`,
                date: date ? new Date(date) : new Date(),
                splitMethod: "even",
                manualSplits: [{ user: user._id, amount: amount }],
                splitsInSgd: [{ user: user._id, amount: amountInSgd }],
            });

            console.log(`Created transaction ${newPurchase._id} for user ${user.username}`);

            const purchase = newPurchase as any;
            await notifyTransactionCreated(
                purchase._id.toString(),
                user._id,
                purchase.transactionName,
                purchase.amount,
                purchase.currency
            );

            res.status(201).json(newPurchase);
            return;
        }

        // Fallback for unknown types
        res.status(400).json({ error: "Unknown transaction type" });

    } catch (err) {
        console.error("Error creating transaction from email:", err);
        res.status(500).json({ error: "Server error" });
    }
};

export default createTransactionFromEmail;
