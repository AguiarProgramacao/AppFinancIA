import { Request, Response } from "express";
import {
  registerService,
  loginService,
  verifyTwoFactorLoginService,
  logoutService,
  requestPasswordReset,
  resetPassword,
} from "../services/auth.service";
import { AuthenticatedRequest } from "../types/auth";
import { handleControllerError } from "../utils/httpError";

export async function register(req: Request, res: Response) {
  try {
    const user = await registerService(req.body);
    return res.status(201).json(user);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const deviceName =
      typeof req.body?.deviceName === "string"
        ? req.body.deviceName.trim()
        : "";
    const result = await loginService(req.body, {
      userAgent:
        deviceName || (req.headers["user-agent"] as string | undefined),
      ip: req.ip,
    });
    return res.json(result);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function verifyTwoFactor(req: Request, res: Response) {
  try {
    const deviceName =
      typeof req.body?.deviceName === "string"
        ? req.body.deviceName.trim()
        : "";
    const result = await verifyTwoFactorLoginService(req.body, {
      userAgent:
        deviceName || (req.headers["user-agent"] as string | undefined),
      ip: req.ip,
    });
    return res.json(result);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    await logoutService(authReq.sessionId);
    return res.status(204).send();
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const email = String(req.body?.email || "").trim();
    if (!email) {
      return res.status(400).json({
        error: "E-mail obrigatorio.",
        code: "EMAIL_REQUIRED",
      });
    }
    const result = await requestPasswordReset(email);
    return res.json(result);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const { tokenId, code, novaSenha } = req.body;
    if (!tokenId || !code || !novaSenha) {
      return res.status(400).json({
        error: "Informe token, codigo e nova senha.",
        code: "RESET_PASSWORD_REQUIRED_FIELDS",
      });
    }
    await resetPassword({ tokenId, code, novaSenha });
    return res.status(204).send();
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}
