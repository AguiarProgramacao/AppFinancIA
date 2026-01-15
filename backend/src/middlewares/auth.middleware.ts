import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";
import { AuthenticatedRequest } from "../types/auth";

interface TokenPayload {
  userId: string;
  sessionId: string;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: "Token nao informado.",
      code: "TOKEN_MISSING",
    });
    return;
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as TokenPayload;

    const session = await prisma.sessao.findUnique({
      where: { id: decoded.sessionId },
    });

    if (!session || session.revogadoEm) {
      res.status(401).json({
        error: "Sua sessao expirou. Faça login novamente.",
        code: "SESSION_EXPIRED",
      });
      return;
    }

    await prisma.sessao.update({
      where: { id: decoded.sessionId },
      data: { ultimoAcesso: new Date() },
    });

    const authReq = req as AuthenticatedRequest;
    authReq.userId = decoded.userId;
    authReq.sessionId = decoded.sessionId;
    next();
  } catch {
    res.status(401).json({
      error: "Token invalido. Faça login novamente.",
      code: "TOKEN_INVALID",
    });
  }
}
