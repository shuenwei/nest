import { Router } from "express";
import translate from "../controllers/translation/translate";

const router = Router();

router.post("/", translate);

export default router;
