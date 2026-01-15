import { Router } from "express";
import {
  register,
  login,
  verifyTwoFactor,
  logout,
  forgotPassword,
  resetPasswordHandler,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-2fa", verifyTwoFactor);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordHandler);
router.post("/logout", authMiddleware, logout);

export default router;
