import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import * as controller from "../controllers/profile.controller";

const router = Router();

router.use(authMiddleware);
router.get("/", controller.profile);
router.put("/", controller.update);

export default router;
