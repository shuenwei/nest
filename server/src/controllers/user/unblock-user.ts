import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { User } from "../../models/User";

const unblockUser = async (req: Request, res: Response): Promise<void> => {
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

  try {
    const userObjId = new Types.ObjectId(userId);
    const blockObjId = new Types.ObjectId(blockId);

    const user = await User.findById(userObjId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!user.blockedUsers?.includes(blockObjId)) {
      res.status(400).json({ error: "User is not blocked" });
      return;
    }

    const blockedUser = await User.findById(blockObjId);
    const displayName = blockedUser?.displayName;

    await User.findByIdAndUpdate(userObjId, {
      $pull: { blockedUsers: blockObjId },
    });

    res
      .status(200)
      .json({ message: "User unblocked successfully", displayName });
  } catch (err) {
    console.error("Error unblocking user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default unblockUser;
