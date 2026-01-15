import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  confirmTwoFactor,
  disableTwoFactorHandler,
  requestTwoFactor,
  revokeOtherSessionsHandler,
  revokeSessionHandler,
  sessions,
  status,
  updatePassword,
} from "../controllers/security.controller";

const router = Router();

router.use(authMiddleware);

router.get("/status", status);
router.post("/password", updatePassword);
router.post("/2fa/request", requestTwoFactor);
router.post("/2fa/confirm", confirmTwoFactor);
router.post("/2fa/disable", disableTwoFactorHandler);
router.get("/sessions", sessions);
router.post("/sessions/revoke/:id", revokeSessionHandler);
router.post("/sessions/revoke-others", revokeOtherSessionsHandler);

export default router;
