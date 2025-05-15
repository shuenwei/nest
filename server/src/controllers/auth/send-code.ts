import { Request, Response } from 'express';
import { VerificationCode } from '../../models/VerificationCode';

function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendVerificationCode = async (req: Request, res: Response): Promise<void> => {
  const { username } = req.params;

  if (!username) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  const code = generateSixDigitCode();

  try {
    await VerificationCode.findOneAndUpdate(
      { username }, // Find by username
      { code, createdAt: new Date() }, // Update code and timestamp
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: 'Verification code generated'});
  } catch (err) {
    console.error('Error generating code:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default sendVerificationCode;
