import { Router } from "express";
import { resumo } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/resumo", authMiddleware, resumo);

export default router;