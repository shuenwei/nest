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
      }>("friends", "username displayName profilePhoto profilePhotoContentType photoUrl hasSignedUp")
      .populate<{ blockedUsers: IFriend[] }>(
        "blockedUsers",
        "username displayName profilePhoto profilePhotoContentType photoUrl hasSignedUp"
      );

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const base64Photo =
      includePhotos && user.profilePhoto
        ? `data:${user.get("profilePhotoContentType") || "image/jpeg"};base64,${user.profilePhoto.toString("base64")}`
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
      photoUrl: user.get("photoUrl"),
      verifiedAt: user.verifiedAt,
      hasSignedUp: user.hasSignedUp,
      isAdmin: user.get("isAdmin") || false,
      profilePhoto: base64Photo,
      friends: friends.map((friend) => ({
        id: friend._id.toString(),
        username: friend.username,
        displayName: friend.displayName,
        hasSignedUp: friend.hasSignedUp,
        photoUrl: (friend as any).photoUrl,
        profilePhoto:
          includePhotos && friend.profilePhoto
            ? `data:${(friend as any).profilePhotoContentType || "image/jpeg"};base64,${friend.profilePhoto.toString("base64")}`
            : undefined,
      })),
      blockedUsers: blockedUsers.map((blocked) => ({
        id: blocked._id.toString(),
        username: blocked.username,
        displayName: blocked.displayName,
        hasSignedUp: blocked.hasSignedUp,
        photoUrl: (blocked as any).photoUrl,
        profilePhoto:
          includePhotos && blocked.profilePhoto
            ? `data:${(blocked as any).profilePhotoContentType || "image/jpeg"};base64,${blocked.profilePhoto.toString("base64")}`
            : undefined,
      })),
      monthlyUsage: user.monthlyUsage,
      limits: {
        scans: user.limits?.scans ?? MONTHLY_SCAN_LIMIT,
        translations: user.limits?.translations ?? MONTHLY_TRANSLATE_LIMIT,
      },
      categories: user.categories.map((cat) => ({
        id: cat._id.toString(),
        name: cat.name,
      })),
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default getUserByTelegramId;
