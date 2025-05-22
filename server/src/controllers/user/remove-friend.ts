import { Request, Response } from "express";
import { Types } from "mongoose";
import { User } from "../../models/User";
import { Transaction } from "../../models/Transaction";

const removeFriend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, friendId } = req.body;

    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(friendId)) {
      res.status(400).json({ error: "Invalid userId or friendId" });
      return;
    }

    const userObjId = new Types.ObjectId(userId);
    const friendObjId = new Types.ObjectId(friendId);

    // Step 1: Compute balance between user and friend
    const pipeline = [
      {
        $match: {
          $or: [{ participants: { $in: [userObjId, friendObjId] } }],
        },
      },
      {
        $facet: {
          purchaseBill: [
            {
              $match: {
                type: { $in: ["purchase", "bill", "recurring"] },
              },
            },
            { $unwind: "$splitsInSgd" },
            {
              $project: {
                from: "$paidBy",
                to: "$splitsInSgd.user",
                amount: "$splitsInSgd.amount",
              },
            },
          ],
          settleup: [
            { $match: { type: "settleup" } },
            {
              $project: {
                from: "$payer",
                to: "$payee",
                amount: "$amountInSgd",
              },
            },
          ],
        },
      },
      {
        $project: {
          rows: { $concatArrays: ["$purchaseBill", "$settleup"] },
        },
      },
      { $unwind: "$rows" },
      { $replaceRoot: { newRoot: "$rows" } },
      {
        $match: {
          $or: [
            { from: userObjId, to: friendObjId },
            { from: friendObjId, to: userObjId },
          ],
        },
      },
      {
        $project: {
          debit: {
            $cond: [{ $eq: ["$from", userObjId] }, "$amount", 0],
          },
          credit: {
            $cond: [{ $eq: ["$to", userObjId] }, "$amount", 0],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalDebit: { $sum: "$debit" },
          totalCredit: { $sum: "$credit" },
        },
      },
      {
        $project: {
          _id: 0,
          amount: {
            $round: [{ $subtract: ["$totalDebit", "$totalCredit"] }, 2],
          },
        },
      },
    ];

    const [balanceResult] = await Transaction.aggregate(pipeline);
    const balance = balanceResult?.amount ?? 0;

    if (balance !== 0) {
      res
        .status(403)
        .json({ error: "Cannot remove friend: outstanding balance exists" });
      return;
    }

    // Step 2: Remove each other from friends list
    await User.findByIdAndUpdate(userObjId, {
      $pull: { friends: friendObjId },
    });
    await User.findByIdAndUpdate(friendObjId, {
      $pull: { friends: userObjId },
    });

    // Step 3: Check if the removed friend should be deleted
    const updatedFriend = await User.findById(friendObjId).select(
      "friends hasSignedUp"
    );

    if (
      updatedFriend &&
      updatedFriend.friends.length === 0 &&
      !updatedFriend.hasSignedUp
    ) {
      await User.findByIdAndDelete(friendObjId);
    }

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (err) {
    console.error("Error removing friend:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default removeFriend;
