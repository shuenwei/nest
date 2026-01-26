import { Request, Response } from 'express';
import { User } from '../../models/User';
import axios from 'axios';

const updateProfilePhoto = async (req: Request, res: Response): Promise<void> => {
  const { telegramId } = req.params;
  const { profilePhoto, photoUrl } = req.body;

  if (!telegramId || (!profilePhoto && !photoUrl)) {
    res.status(400).json({ error: 'Missing telegramId or photo data' });
    return;
  }

  // Auth Check
  const authUserId = req.auth?.id;
  if (!authUserId) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }

  const requester = await User.findById(authUserId);
  if (!requester) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }

  if (requester.telegramId !== telegramId && !requester.get("isAdmin")) {
    res.status(403).json({ error: "Unauthorised" });
    return;
  }

  try {
    const user = await User.findOne({ telegramId });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let photoBuffer: Buffer | null = null;

    if (profilePhoto) {
      // From bot (base64)
      photoBuffer = Buffer.from(profilePhoto, 'base64');
    } else if (photoUrl) {
      // From Telegram login widget (URL)
      const response = await axios.get(photoUrl, { responseType: 'arraybuffer' });
      photoBuffer = Buffer.from(response.data);
    }

    if (!photoBuffer) {
      res.status(400).json({ error: 'Failed to retrieve photo data' });
      return;
    }

    user.profilePhoto = photoBuffer;
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
