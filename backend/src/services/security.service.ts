import bcrypt from "bcryptjs";
import { prisma } from "../prisma/client";
import { createTwoFactorToken, verifyTwoFactorToken } from "../utils/twoFactor";
import { sendTwoFactorEmail } from "../utils/email";
import { AppError } from "../utils/appError";

export async function getSecurityStatus(userId: string) {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      twoFactorEnabled: true,
      twoFactorEmail: true,
    },
  });

  if (!user) {
    throw new AppError("USER_NOT_FOUND", "Usuario nao encontrado.", 404);
  }

  return user;
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("USER_NOT_FOUND", "Usuario nao encontrado.", 404);
  }

  const valid = await bcrypt.compare(currentPassword, user.senha);

  if (!valid) {
    throw new AppError("INVALID_PASSWORD", "Senha atual incorreta.", 400);
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await prisma.usuario.update({
    where: { id: userId },
    data: { senha: newHash },
  });
}

export async function requestTwoFactorEnable(userId: string) {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("USER_NOT_FOUND", "Usuario nao encontrado.", 404);
  }

  if (user.twoFactorEnabled) {
    throw new AppError(
      "TWO_FACTOR_ALREADY_ENABLED",
      "A autenticacao em duas etapas ja esta ativa.",
      400
    );
  }

  await prisma.twoFactorToken.deleteMany({
    where: { usuarioId: userId, tipo: "enable" },
  });

  const { tokenId, code } = await createTwoFactorToken(userId, "enable");
  await sendTwoFactorEmail(user.email, code, "enable");

  return { tokenId, email: user.email };
}

export async function confirmTwoFactorEnable(
  userId: string,
  tokenId: string,
  code: string
) {
  const token = await verifyTwoFactorToken(tokenId, code, "enable");

  if (token.usuarioId !== userId) {
    throw new AppError("INVALID_2FA_CODE", "Codigo invalido.", 400);
  }

  await prisma.twoFactorToken.delete({ where: { id: tokenId } });

  await prisma.usuario.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorEmail: true,
    },
  });
}

export async function disableTwoFactor(userId: string, password: string) {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("USER_NOT_FOUND", "Usuario nao encontrado.", 404);
  }

  const valid = await bcrypt.compare(password, user.senha);

  if (!valid) {
    throw new AppError("INVALID_PASSWORD", "Senha atual incorreta.", 400);
  }

  await prisma.usuario.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorEmail: false,
    },
  });

  await prisma.twoFactorToken.deleteMany({
    where: { usuarioId: userId },
  });
}

export async function listSessions(userId: string) {
  return prisma.sessao.findMany({
    where: { usuarioId: userId, revogadoEm: null },
    orderBy: { ultimoAcesso: "desc" },
  });
}

export async function revokeSession(userId: string, sessionId: string) {
  const session = await prisma.sessao.findFirst({
    where: { id: sessionId, usuarioId: userId, revogadoEm: null },
  });

  if (!session) {
    throw new AppError("SESSION_NOT_FOUND", "Sessao nao encontrada.", 404);
  }

  await prisma.sessao.update({
    where: { id: sessionId },
    data: { revogadoEm: new Date() },
  });
}

export async function revokeOtherSessions(
  userId: string,
  currentSessionId: string
) {
  await prisma.sessao.updateMany({
    where: {
      usuarioId: userId,
      id: { not: currentSessionId },
      revogadoEm: null,
    },
    data: { revogadoEm: new Date() },
  });
}
