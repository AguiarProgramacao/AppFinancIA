import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  criar,
  listar,
  atualizar,
  remover,
  buscarPorId,
} from "../controllers/transacao.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", criar);
router.get("/", listar);
router.get("/:id", buscarPorId);
router.put("/:id", atualizar);
router.delete("/:id", remover);

export default router;
