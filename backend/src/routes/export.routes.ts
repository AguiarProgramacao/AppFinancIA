import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { exportData, summary } from "../controllers/export.controller";

const router = Router();

router.use(authMiddleware);
router.get("/summary", summary);
router.get("/", exportData);

export default router;
