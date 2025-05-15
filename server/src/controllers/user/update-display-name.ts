import { Request, Response } from 'express';
import { User } from '../../models/User';

const updateDisplayName = async (req: Request, res: Response): Promise<void> => {
  const { username } = req.params;
  const { displayName } = req.body;

  if (!displayName || !username) {
    res.status(400).json({ error: 'Missing display name or username' });
    return;
  }

  try {
    const updated = await User.findOneAndUpdate(
  { username },
  {
    displayName,
    hasSignedUp: true
  },
  { new: true }
);

    if (!updated) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'Display name updated successfully', user: updated });
  } catch (err) {
    console.error('Failed to update display name:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default updateDisplayName;
