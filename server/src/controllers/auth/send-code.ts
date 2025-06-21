import { Request, Response } from "express";
import otp from "../../utils/otp";

const sendVerificationCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username } = req.params;

  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  try {
    otp.generate(username);
    res.status(200).json({ message: "Verification code generated" });
  } catch (err) {
    console.error("Error generating code:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default sendVerificationCode;
