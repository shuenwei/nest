import { Request, Response } from "express";
import { User } from "../../models/User";
import { Types } from "mongoose";

interface IFriend {
  _id: Types.ObjectId;
  username: string;
  displayName: string;
  profilePhoto?: Buffer;
  hasSignedUp: boolean;
}

const getUserByUsername = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username } = req.params;

  const lowercaseUsername = username.toLowerCase();

  try {
    const user = await User.findOne({ username: lowercaseUsername }).populate<{
      friends: IFriend[];
    }>("friends", "username displayName profilePhoto hasSignedUp");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const base64Photo = user.profilePhoto
      ? `data:image/jpeg;base64,${user.profilePhoto.toString("base64")}`
      : null;

    const friends = Array.isArray(user.friends) ? user.friends : [];

    res.status(200).json({
      id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      telegramId: user.telegramId,
      verifiedAt: user.verifiedAt,
      hasSignedUp: user.hasSignedUp,
      profilePhoto: base64Photo,
      friends: friends.map((friend) => ({
        id: friend._id.toString(),
        username: friend.username,
        displayName: friend.displayName,
        hasSignedUp: friend.hasSignedUp,
        profilePhoto: friend.profilePhoto
          ? `data:image/jpeg;base64,${friend.profilePhoto.toString("base64")}`
          : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default getUserByUsername;
