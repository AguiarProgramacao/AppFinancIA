import { Router } from "express";
import { categorias } from "../controllers/graficos.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/categorias", authMiddleware, categorias);

export default router;
