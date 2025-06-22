import { Request, Response } from "express";
import { User } from "../../models/User";
import mongoose from "mongoose";

const addFriend = async (req: Request, res: Response): Promise<void> => {
  const { userId, friendId } = req.body;

  const authUserId = req.auth?.id?.toString();
  if (!authUserId || authUserId !== userId) {
    res.status(403).json({ error: "Unauthorised" });
    return;
  }

  // Basic validation
  if (!userId || !friendId) {
    res.status(400).json({ error: "Missing userId or friendId" });
    return;
  }

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(friendId)
  ) {
    res.status(400).json({ error: "Invalid user ID(s)" });
    return;
  }

  if (userId === friendId) {
    res.status(400).json({ error: "Cannot add yourself as a friend" });
    return;
  }

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      res.status(404).json({ error: "User or friend not found" });
      return;
    }

    if (user.blockedUsers.includes(friend._id)) {
      res.status(403).json({ error: "User is blocked" });
      return;
    }

    if (friend.blockedUsers.includes(user._id)) {
      res.status(403).json({ error: "Friend has blocked you" });
      return;
    }

    if (user.friends.includes(friend._id)) {
      res.status(400).json({ error: "User is already your friend" });
      return;
    }

    // Add friendId to user.friends (no duplicates)
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friends: friend._id },
    });

    // Make it mutual
    await User.findByIdAndUpdate(friendId, {
      $addToSet: { friends: user._id },
    });

    res.status(200).json({ message: "Friend added successfully" });
  } catch (err) {
    console.error("Error adding friend:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default addFriend;
