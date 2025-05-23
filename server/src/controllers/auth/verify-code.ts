import { Request, Response } from "express";
import { VerificationCode } from "../../models/VerificationCode";
import jwt from "../../utils/jwt";
import { User } from "../../models/User";

const verifyVerificationCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, code } = req.body;

  if (!username || !code) {
    res.status(400).json({ error: "Missing parameters" });
    return;
  }

  try {
    const otpRecord = await VerificationCode.findOne({ username });

    if (!otpRecord || otpRecord.code !== code) {
      res.status(200).json({ valid: false });
      return;
    }

    await VerificationCode.deleteOne({ _id: otpRecord._id });
    const user = await User.findOne({ username });
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
