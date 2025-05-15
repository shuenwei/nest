import { Request, Response } from 'express';
import { VerificationCode } from '../../models/VerificationCode';

const verifyVerificationCode = async (req: Request, res: Response): Promise<void> => {
  const { username, code } = req.body;

  if (!username || !code) {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }

  try {
    const otpRecord = await VerificationCode.findOne({ username });

    if (!otpRecord || otpRecord.code !== code) {
      res.status(200).json({ valid: false });
      return;
    }

    res.status(200).json({ valid: true });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ valid: false });
  }
};

export default verifyVerificationCode;
