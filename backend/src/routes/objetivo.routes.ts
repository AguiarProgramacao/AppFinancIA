import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import * as controller from "../controllers/objetivo.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", controller.criar);
router.get("/", controller.listar);
router.get("/:id", controller.buscarPorId);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.remover);
router.post("/:id/aportar", controller.aportar);

export default router;
