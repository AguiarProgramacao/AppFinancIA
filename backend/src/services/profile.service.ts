import { prisma } from "../prisma/client";
import { AppError } from "../utils/appError";

export interface ProfileUpdateInput {
  nome?: string;
  remuneracao?: number;
  fotoPerfil?: string | null;
}

export async function getProfile(userId: string) {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nome: true,
      email: true,
      remuneracao: true,
      fotoPerfil: true,
    },
  });

  if (!user) {
    throw new AppError("USER_NOT_FOUND", "Usuario nao encontrado.", 404);
  }

  return user;
}

export async function updateProfile(
  userId: string,
  input: ProfileUpdateInput
) {
  const exists = await prisma.usuario.findUnique({
    where: { id: userId },
  });

  if (!exists) {
    throw new AppError("USER_NOT_FOUND", "Usuario nao encontrado.", 404);
  }

  const user = await prisma.usuario.update({
    where: { id: userId },
    data: {
      nome: input.nome,
      remuneracao: input.remuneracao,
      fotoPerfil: input.fotoPerfil ?? undefined,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      remuneracao: true,
      fotoPerfil: true,
    },
  });

  return user;
}
