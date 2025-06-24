import { Request, Response } from "express";
import { Types } from "mongoose";
import { User } from "../../models/User";
import { Transaction } from "../../models/Transaction";
import { RecurringTemplate } from "../../models/RecurringTemplate";

const removeFriend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, friendId } = req.body;

    const authUserId = req.auth?.id?.toString();
    if (!authUserId || authUserId !== userId) {
      res.status(403).json({ error: "Unauthorised" });
      return;
    }

    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(friendId)) {
      res.status(400).json({ error: "Invalid userId or friendId" });
      return;
    }

    const userObjId = new Types.ObjectId(userId);
    const friendObjId = new Types.ObjectId(friendId);

    // Step 1: Check for any transactions or recurring templates involving both users
    const existingTx = await Transaction.exists({
      participants: { $all: [userObjId, friendObjId] },
    });

    const existingTpl = await RecurringTemplate.exists({
      participants: { $all: [userObjId, friendObjId] },
    });

    if (existingTx || existingTpl) {
      res
        .status(403)
        .json({ error: "Cannot remove friend: transactions exists" });
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
      const friendHasTx = await Transaction.exists({
        participants: friendObjId,
      });
      const friendHasTpl = await RecurringTemplate.exists({
        participants: friendObjId,
      });
      if (!friendHasTx && !friendHasTpl) {
        await User.findByIdAndDelete(friendObjId);
      }
    }

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (err) {
    console.error("Error removing friend:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default removeFriend;
