import { Request, Response } from "express";
import jwt from "../../utils/jwt";

const verifyToken = (req: Request, res: Response): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(400).json({ error: "Token not provided" });
    return;
  }

  try {
    const decoded = jwt.verifyToken(token);
    const payload = typeof decoded === "string" ? JSON.parse(decoded) : decoded;

    res.status(200).json({ valid: true, payload });
  } catch (err) {
    res.status(401).json({ valid: false, error: "Invalid or expired token" });
  }
};

export default verifyToken;
