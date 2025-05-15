import express from 'express'
import getUser from '../controllers/user/get-user';
import updateDisplayName from '../controllers/user/update-display-name';

// initialize router
const router = express.Router()

router.get('/:username', getUser);
router.patch('/displayname/:username', updateDisplayName);

export default router
