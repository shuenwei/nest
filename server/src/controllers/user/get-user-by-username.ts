import { Request, Response } from 'express';
import { User } from '../../models/User';

const getUserByUsername = async (req: Request, res: Response): Promise<void> => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const base64Photo = user.profilePhoto
      ? `data:image/jpeg;base64,${user.profilePhoto.toString('base64')}`
      : null;

    res.status(200).json({
      id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      telegramId: user.telegramId,
      verifiedAt: user.verifiedAt,
      hasSignedUp: user.hasSignedUp,
      profilePhoto: base64Photo,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default getUserByUsername;
