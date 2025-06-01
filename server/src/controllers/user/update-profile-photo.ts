import { Request, Response } from 'express';
import { User } from '../../models/User';

const updateProfilePhoto = async (req: Request, res: Response): Promise<void> => {
  const { telegramId, profilePhoto } = req.body;

  if (!telegramId || !profilePhoto) {
    res.status(400).json({ error: 'Missing telegramId or profilePhoto' });
    return;
  }

  try {
    const user = await User.findOne({ telegramId });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.profilePhoto = Buffer.from(profilePhoto, 'base64');
    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Profile photo updated successfully',
      id: updatedUser._id.toString(),
      username: updatedUser.username,
    });
  } catch (error) {
    console.error('Error updating profile photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default updateProfilePhoto;
