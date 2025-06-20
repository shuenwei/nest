import { Request, Response } from "express";
import { User } from "../../models/User";

const createUser = async (req: Request, res: Response): Promise<void> => {
  const { username, displayName } = req.body;

  if (!username || !displayName) {
    res.status(400).json({ error: "Missing username or display name" });
    return;
  }

  const lowercaseUsername = username.toLowerCase();

  try {
    const existingUser = await User.findOne({ username: lowercaseUsername });
    if (existingUser) {
      res.status(409).json({ error: "User with this username already exists" });
      return;
    }

    const newUser = new User({
      username: lowercaseUsername,
      displayName,
      friends: [],
    });

    const savedUser = await newUser.save();

    const base64Photo = savedUser.profilePhoto
      ? `data:image/jpeg;base64,${savedUser.profilePhoto.toString("base64")}`
      : null;

    res.status(201).json({
      id: savedUser._id.toString(),
      username: savedUser.username,
      displayName: savedUser.displayName,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default createUser;
