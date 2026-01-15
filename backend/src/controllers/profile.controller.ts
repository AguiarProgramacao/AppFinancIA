import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { getProfile, updateProfile } from "../services/profile.service";
import { handleControllerError } from "../utils/httpError";

export async function profile(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await getProfile(authReq.userId);
    return res.json(data);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function update(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const { nome, remuneracao, fotoPerfil } = req.body;

    if (remuneracao !== undefined && Number.isNaN(Number(remuneracao))) {
      return res.status(400).json({
        error: "Remuneracao invalida.",
        code: "INVALID_REMUNERATION",
      });
    }

    const data = await updateProfile(authReq.userId, {
      nome: nome?.trim(),
      remuneracao:
        remuneracao !== undefined ? Number(remuneracao) : undefined,
      fotoPerfil: fotoPerfil ?? undefined,
    });

    return res.json(data);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}
