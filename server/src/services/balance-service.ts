import mongoose, { ClientSession } from "mongoose";
import { Balance } from "../models/Balance";
import { Transaction, BaseTransaction } from "../models/Transaction";
import { PurchaseTransaction } from "../models/PurchaseTransaction";
import { BillTransaction } from "../models/BillTransaction";
import { RecurringTransaction } from "../models/RecurringTransaction";
import { SettleUpTransaction } from "../models/SettleUpTransaction";
import { GroupSmartSettleTransaction } from "../models/GroupSmartSettleTransaction";

/* Type guard helpers would be nice, but we can do structural checks or type assertions */
type AnyTransaction = BaseTransaction &
    Partial<PurchaseTransaction> &
    Partial<BillTransaction> &
    Partial<RecurringTransaction> &
    Partial<SettleUpTransaction> &
    Partial<GroupSmartSettleTransaction>;

interface Transfer {
    from: string;
    to: string;
    amount: number;
}

const round = (num: number) => Math.round(num * 100) / 100;

export const BalanceService = {
    /**
     * Updates (increments) the balance between two users.
     * If `amount` is positive, `user` creates credit against `friend` (friend owes user).
     *
     * We update TWO documents:
     * 1. { user: A, friend: B } -> amount += delta
     * 2. { user: B, friend: A } -> amount -= delta
     */
    async updateBalance(
        userId: string,
        friendId: string,
        delta: number,
        session?: ClientSession
    ) {
        if (userId === friendId) return; // Self-payments don't affect balance
        if (delta === 0) return;

        // 1. Update User -> Friend
        await Balance.findOneAndUpdate(
            { user: userId, friend: friendId },
            [
                {
                    $set: {
                        amount: {
                            $round: [{ $add: [{ $ifNull: ["$amount", 0] }, delta] }, 2],
                        },
                    },
                },
            ],
            { upsert: true, session }
        );

        // 2. Update Friend -> User (inverse)
        await Balance.findOneAndUpdate(
            { user: friendId, friend: userId },
            [
                {
                    $set: {
                        amount: {
                            $round: [{ $add: [{ $ifNull: ["$amount", 0] }, -delta] }, 2],
                        },
                    },
                },
            ],
            { upsert: true, session }
        );
    },

    /**
     * Extract all atomic transfers (A sends money to B) from a transaction.
     * "Transfer" here means "A Paid for B", so B owes A.
     * In a split: PaidBy creates a credit against SplitUser.
     * In SettleUp: Payer pays Payee. This REDUCES debt.
     *    If Alice owes Bob $50, Alice (Payer) pays Bob (Payee) $50.
     *    In our balance model (User->Friend = Amount Owed TO User),
     *    Bob's view: Alice owed him (Positive).
     *    Alice paying Bob ==> Bob's credit should decrease.
     *    Wait. Let's trace carefully.
     *
     *    Concept: "Balance" > 0 means "They owe me".
     *
     *    Scenario: Alice buys lunch ($10) for Bob.
     *    - PaidBy: Alice. Split: Bob ($10).
     *    - Alice's Balance w/ Bob should INCREASE by 10.
     *    - Transfer: From Alice To Bob ($10).
     *
     *    Scenario: Alice pays Bob $10 back (SettleUp).
     *    - Payer: Alice. Payee: Bob.
     *    - Alice's Balance w/ Bob should DECREASE (or go negative if she prepays).
     *    - Effectively, Bob received money.
     *    - This is equivalent to Bob buying something for Alice? No.
     *    - This is a direct flow.
     *    - If Alice pays Bob, Alice is "giving value" to Bob.
     *    - Just like "Alice buys lunch for Bob" is Alice giving value (lunch) to Bob.
     *    - So: Payer (Alice) -> Payee (Bob).
     *    - Alice is the "provider". Bob is the "receiver".
     *    - So Alice's credit against Bob INCREASES?
     *      - Wait. If Alice owes Bob $10. Balance(Alice->Bob) = -10. Balance(Bob->Alice) = +10.
     *      - Alice pays Bob $10.
     *      - Balance(Alice->Bob) should become 0. (-10 + 10).
     *      - So yes, SettleUp (Alice pays Bob) INCREASES Alice's balance score.
     *
     *    Conclusion:
     *    - Purchase: PaidBy -> SplitUser (Amount)
     *    - SettleUp: Payer -> Payee (Amount)
     *    - SmartSettle: Payer -> Payee (Amount)
     */
    extractTransfers(tx: AnyTransaction): Transfer[] {
        const transfers: Transfer[] = [];
        const type = tx.type;

        if (type === "purchase" || type === "bill" || type === "recurring") {
            const paidBy = tx.paidBy?.toString();
            if (!paidBy || !tx.splitsInSgd) return [];

            for (const split of tx.splitsInSgd) {
                const splitUser = split.user.toString();
                if (splitUser !== paidBy) {
                    transfers.push({
                        from: paidBy,
                        to: splitUser,
                        amount: split.amount,
                    });
                }
            }
        } else if (type === "settleup") {
            if (tx.payer && tx.payee && tx.amountInSgd) {
                transfers.push({
                    from: tx.payer.toString(),
                    to: tx.payee.toString(),
                    amount: tx.amountInSgd,
                });
            }
        } else if (type === "groupSmartSettle") {
            if (tx.transfers) {
                for (const t of tx.transfers) {
                    transfers.push({
                        from: t.payer.toString(),
                        to: t.payee.toString(),
                        amount: t.amount,
                    });
                }
            }
        }

        return transfers;
    },

    /**
     * Called when a transaction is Created, Updated, or Deleted.
     * - Created: oldTx = null, newTx = Document
     * - Deleted: oldTx = Document, newTx = null
     * - Updated: oldTx = Document, newTx = Document
     */
    async handleTransactionChange(
        oldTx: any,
        newTx: any,
        session?: ClientSession
    ) {
        const deltaMap = new Map<string, number>();

        // Helper to add current accumulated changes
        const add = (u1: string, u2: string, amt: number) => {
            // canonical key to avoid duplication (though direction matters for sign)
            // Actually, let's just use "from->to" as key.
            const key = `${u1}:${u2}`;
            deltaMap.set(key, (deltaMap.get(key) || 0) + amt);
        };

        // 1. Revert Old (Subtract)
        if (oldTx) {
            const oldTransfers = this.extractTransfers(oldTx);
            for (const t of oldTransfers) {
                // "from" GAVE to "to".
                // Reverting means "from" takes back (or negative give).
                // Balance(from->to) -= amt
                add(t.from, t.to, -t.amount);
            }
        }

        // 2. Apply New (Add)
        if (newTx) {
            const newTransfers = this.extractTransfers(newTx);
            for (const t of newTransfers) {
                // "from" GIVES to "to".
                // Balance(from->to) += amt
                add(t.from, t.to, t.amount);
            }
        }

        // 3. Commit updates
        for (const [key, amount] of deltaMap.entries()) {
            const roundedAmount = round(amount);
            if (Math.abs(roundedAmount) < 0.01) continue;

            const [p1, p2] = key.split(":");
            await this.updateBalance(p1, p2, roundedAmount, session);
        }
    },

    /**
     * Migration / Repair Tool
     * Recalculates ALL balances from scratch.
     * WARNING: heavy operation.
     */
    async recalculateAllBalances() {
        console.log("Starting full balance recalculation...");

        // Clear existing
        await Balance.deleteMany({});

        // Process all transactions
        // Use lean() to ensure we get all fields (like splitsInSgd) even if Mongoose
        // discriminators aren't set up perfectly or if keys are missing from base schema.
        const cursor = Transaction.find({}).lean().cursor();

        let count = 0;
        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            try {
                await this.handleTransactionChange(null, doc as AnyTransaction);
                count++;
                if (count % 100 === 0) console.log(`Processed ${count} transactions...`);
            } catch (err) {
                console.error(`Error processing tx ${doc._id}:`, err);
            }
        }

        console.log(`Recalculation complete. Processed ${count} transactions.`);
    },
};
