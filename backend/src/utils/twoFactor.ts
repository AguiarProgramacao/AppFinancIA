import bcrypt from "bcryptjs";
import { addMinutes } from "date-fns";
import { prisma } from "../prisma/client";
import { AppError } from "./appError";

const TWO_FACTOR_TTL_MINUTES = 10;

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createTwoFactorToken(
  userId: string,
  tipo: "login" | "enable" | "reset"
) {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);

  const token = await prisma.twoFactorToken.create({
    data: {
      usuarioId: userId,
      codeHash,
      expiresAt: addMinutes(new Date(), TWO_FACTOR_TTL_MINUTES),
      tipo,
    },
  });

  return { tokenId: token.id, code };
}

export async function verifyTwoFactorToken(
  tokenId: string,
  code: string,
  tipo: "login" | "enable" | "reset"
) {
  const token = await prisma.twoFactorToken.findUnique({
    where: { id: tokenId },
    include: { usuario: true },
  });

  if (!token || token.tipo !== tipo) {
    throw new AppError("INVALID_2FA_CODE", "Codigo invalido.", 400);
  }

  if (token.expiresAt.getTime() < Date.now()) {
    await prisma.twoFactorToken.delete({ where: { id: tokenId } });
    throw new AppError("EXPIRED_2FA_CODE", "Codigo expirado.", 400);
  }

  const valid = await bcrypt.compare(code, token.codeHash);

  if (!valid) {
    throw new AppError("INVALID_2FA_CODE", "Codigo invalido.", 400);
  }

  return token;
}
