import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { User } from "../../models/User";
import { Transaction } from "../../models/Transaction";
import { RecurringTemplate } from "../../models/RecurringTemplate";

const blockUser = async (req: Request, res: Response): Promise<void> => {
  const { userId, blockId } = req.body;

  const authUserId = req.auth?.id?.toString();
  if (!authUserId || authUserId !== userId) {
    res.status(403).json({ error: "Unauthorised" });
    return;
  }

  if (!userId || !blockId) {
    res.status(400).json({ error: "Missing userId or blockId" });
    return;
  }

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(blockId)
  ) {
    res.status(400).json({ error: "Invalid user ID(s)" });
    return;
  }

  if (userId === blockId) {
    res.status(400).json({ error: "You cannot block yourself." });
    return;
  }

  try {
    const user = await User.findById(userId);
    const blocked = await User.findById(blockId);

    if (!blocked) {
      res.status(404).json({ error: "User to be blocked cannot be found." });
      return;
    }
    if (!user || !blocked) {
      res.status(404).json({ error: "User cannot be found." });
      return;
    }

    const userObjId = new Types.ObjectId(userId);
    const blockObjId = new Types.ObjectId(blockId);

    if (user.blockedUsers?.includes(blockObjId)) {
      res.status(400).json({ error: "User is already blocked." });
      return;
    }

    // Remove each other as friends
    await User.findByIdAndUpdate(userObjId, { $pull: { friends: blockObjId } });
    await User.findByIdAndUpdate(blockObjId, { $pull: { friends: userObjId } });

    // Add to blocked list
    await User.findByIdAndUpdate(userObjId, {
      $addToSet: { blockedUsers: blockObjId },
    });

    // Delete all transactions between the two users
    await Transaction.deleteMany({
      participants: { $all: [userObjId, blockObjId] },
    });

    // Delete recurring templates involving both users
    await RecurringTemplate.deleteMany({
      participants: { $all: [userObjId, blockObjId] },
    });

    res.status(200).json({ message: "User blocked successfully" });
  } catch (err) {
    console.error("Error blocking user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default blockUser;
