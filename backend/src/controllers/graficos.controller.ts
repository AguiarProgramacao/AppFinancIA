import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { resumoPorCategoria } from "../services/graficos.service";
import { handleControllerError } from "../utils/httpError";

export const categorias: RequestHandler = async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { periodo = "todos" } = req.query;

    const data = await resumoPorCategoria(userId!, periodo as string);
    return res.json(data);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};
