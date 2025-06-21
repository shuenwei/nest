import { Request, Response } from "express";
import jwt from "../../utils/jwt";
import { User } from "../../models/User";
import otp from "../../utils/otp";

const verifyVerificationCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, code } = req.body;

  if (!username || !code) {
    res.status(400).json({ error: "Missing parameters" });
    return;
  }

  const lowercaseUsername = username.toLowerCase();

  try {
    if (!otp.verify(username, code)) {
      res.status(200).json({ valid: false });
      return;
    }

    const user = await User.findOne({ username: lowercaseUsername });
    if (!user) {
      res.status(500).json({ valid: false });
      return;
    }

    const token = jwt.signToken(
      { id: user._id, telegramId: user.telegramId },
      "14d"
    );
    res.status(200).json({ valid: true, token });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ valid: false });
  }
};

export default verifyVerificationCode;
