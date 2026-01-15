import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import {
  getNotificationPreferences,
  atualizarPushToken,
  updateNotificationPreferences,
} from "../services/notifications.service";
import { handleControllerError } from "../utils/httpError";

export async function preferences(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await getNotificationPreferences(authReq.userId);
    return res.json(data);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function updatePreferences(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    await updateNotificationPreferences(authReq.userId, req.body);
    return res.status(204).send();
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function registerPushToken(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const token = String(req.body?.token || "").trim();
    if (!token) {
      return res.status(400).json({
        error: "Token invalido.",
        code: "INVALID_PUSH_TOKEN",
      });
    }

    await atualizarPushToken(authReq.userId, token);
    return res.status(204).send();
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}
