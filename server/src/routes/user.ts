import express from "express";
import getUserByUsername from "../controllers/user/get-user-by-username";
import getUserByTelegramId from "../controllers/user/get-user-by-telegramid";
import updateDisplayName from "../controllers/user/update-display-name";
import addFriend from "../controllers/user/add-friend";
import removeFriend from "../controllers/user/remove-friend";
import createUser from "../controllers/user/create-user";

// initialize router
const router = express.Router();

router.get("/username/:username", getUserByUsername);
router.get("/telegramid/:telegramId", getUserByTelegramId);
router.patch("/displayname/:telegramId", updateDisplayName);
router.post("/addfriend", addFriend);
router.post("/create", createUser);
router.delete("/removefriend", removeFriend);

export default router;
