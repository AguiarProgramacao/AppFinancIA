import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import {
  changePassword,
  confirmTwoFactorEnable,
  disableTwoFactor,
  getSecurityStatus,
  listSessions,
  requestTwoFactorEnable,
  revokeOtherSessions,
  revokeSession,
} from "../services/security.service";
import { handleControllerError } from "../utils/httpError";

export async function status(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await getSecurityStatus(authReq.userId);
    return res.json(data);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function updatePassword(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const { senhaAtual, novaSenha } = req.body;
    await changePassword(authReq.userId, senhaAtual, novaSenha);
    return res.status(204).send();
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function requestTwoFactor(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const result = await requestTwoFactorEnable(authReq.userId);
    return res.json({
      tokenId: result.tokenId,
      email: result.email,
    });
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function confirmTwoFactor(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const { tokenId, code } = req.body;
    await confirmTwoFactorEnable(authReq.userId, tokenId, code);
    return res.status(204).send();
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function disableTwoFactorHandler(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const { senhaAtual } = req.body;
    await disableTwoFactor(authReq.userId, senhaAtual);
    return res.status(204).send();
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function sessions(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await listSessions(authReq.userId);
    return res.json({
      currentSessionId: authReq.sessionId,
      sessions: data,
    });
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function revokeSessionHandler(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    await revokeSession(authReq.userId, req.params.id);
    return res.status(204).send();
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function revokeOtherSessionsHandler(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    await revokeOtherSessions(authReq.userId, authReq.sessionId);
    return res.status(204).send();
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}
