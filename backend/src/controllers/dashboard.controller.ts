import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../types/auth";
import * as service from "../services/dashboard.service";
import { handleControllerError } from "../utils/httpError";

export const resumo: RequestHandler = async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;

    const mesRaw = req.query.mes;
    const anoRaw = req.query.ano;
    const mesNum = typeof mesRaw === "string" ? Number(mesRaw) : NaN;
    const anoNum = typeof anoRaw === "string" ? Number(anoRaw) : NaN;
    let mes: number | undefined;
    let ano: number | undefined;

    if (Number.isFinite(mesNum)) {
      if (mesNum >= 0 && mesNum <= 11) {
        mes = mesNum;
      } else if (mesNum >= 1 && mesNum <= 12) {
        mes = mesNum - 1;
      }
    }

    if (Number.isFinite(anoNum) && anoNum >= 1970) {
      ano = anoNum;
    }

    const data = await service.resumoDashboard(userId!, mes, ano);
    return res.json(data);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};
