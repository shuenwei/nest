import { Request, Response } from "express";
import { User } from "../../models/User";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const auth = req.auth;

        if (!auth || !auth.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const currentUser = await User.findById(auth.id);

        if (!currentUser || !currentUser.isAdmin) {
            res.status(403).json({ error: "Access denied. Admins only." });
            return;
        }

        const users = await User.find({}, "telegramId username displayName profilePhoto isAdmin hasSignedUp verifiedAt");

        const formattedUsers = users.map(user => ({
            _id: user._id,
            telegramId: user.telegramId,
            username: user.username,
            displayName: user.displayName,
            isAdmin: user.isAdmin,
            hasSignedUp: user.hasSignedUp,
            verifiedAt: user.verifiedAt,
            profilePhoto: user.profilePhoto
                ? `data:image/jpeg;base64,${user.profilePhoto.toString("base64")}`
                : null
        }));

        res.status(200).json(formattedUsers);
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export default getAllUsers;
