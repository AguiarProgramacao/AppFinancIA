import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  preferences,
  registerPushToken,
  updatePreferences,
} from "../controllers/notifications.controller";

const router = Router();

router.use(authMiddleware);
router.get("/preferences", preferences);
router.put("/preferences", updatePreferences);
router.post("/push-token", registerPushToken);

export default router;
