import { Request, Response } from "express";
import { User } from "../../models/User";
import { Types } from "mongoose";
import { MONTHLY_SCAN_LIMIT, MONTHLY_TRANSLATE_LIMIT } from "../../constants";

interface IFriend {
  _id: Types.ObjectId;
  username: string;
  displayName: string;
  profilePhoto?: Buffer;
  hasSignedUp: boolean;
}

const getUserByTelegramId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { telegramId } = req.params;

  try {
    const includePhotos = req.query.includePhotos !== "false";

    const user = await User.findOne({ telegramId })
      .populate<{
        friends: IFriend[];
      }>("friends", "username displayName profilePhoto hasSignedUp")
      .populate<{ blockedUsers: IFriend[] }>(
        "blockedUsers",
        "username displayName profilePhoto hasSignedUp"
      );

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const base64Photo =
      includePhotos && user.profilePhoto
        ? `data:image/jpeg;base64,${user.profilePhoto.toString("base64")}`
        : undefined;

    const friends = Array.isArray(user.friends) ? user.friends : [];
    const blockedUsers = Array.isArray(user.blockedUsers)
      ? user.blockedUsers
      : [];

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
        profilePhoto:
          includePhotos && friend.profilePhoto
            ? `data:image/jpeg;base64,${friend.profilePhoto.toString("base64")}`
            : undefined,
      })),
      blockedUsers: blockedUsers.map((blocked) => ({
        id: blocked._id.toString(),
        username: blocked.username,
        displayName: blocked.displayName,
        hasSignedUp: blocked.hasSignedUp,
        profilePhoto:
          includePhotos && blocked.profilePhoto
            ? `data:image/jpeg;base64,${blocked.profilePhoto.toString("base64")}`
            : undefined,
      })),
      monthlyUsage: user.monthlyUsage,
      limits: {
        scans: user.limits?.scans ?? MONTHLY_SCAN_LIMIT,
        translations: user.limits?.translations ?? MONTHLY_TRANSLATE_LIMIT,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default getUserByTelegramId;
