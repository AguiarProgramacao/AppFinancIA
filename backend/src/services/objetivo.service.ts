import { prisma } from "../prisma/client";
import { AppError } from "../utils/appError";

export function criarObjetivo(userId: string, data: any) {
  return prisma.objetivo.create({
    data: {
      ...data,
      usuarioId: userId,
      dataLimite: new Date(data.dataLimite),
    },
  });
}

export function listarObjetivos(userId: string) {
  return prisma.objetivo.findMany({
    where: { usuarioId: userId },
    orderBy: { dataLimite: "asc" },
  });
}

export function buscarObjetivoPorId(userId: string, id: string) {
  return prisma.objetivo.findFirst({
    where: {
      id,
      usuarioId: userId,
    },
    include: {
      aportes: {
        orderBy: {
          data: "desc",
        },
      },
    },
  });
}

export async function atualizarObjetivo(
  userId: string,
  id: string,
  data: any
) {
  const objetivo = await prisma.objetivo.findFirst({
    where: { id, usuarioId: userId },
  });

  if (!objetivo) {
    throw new AppError("GOAL_NOT_FOUND", "Objetivo nao encontrado.", 404);
  }

  return prisma.objetivo.update({
    where: { id },
    data,
  });
}

export async function deletarObjetivo(userId: string, id: string) {
  const objetivo = await prisma.objetivo.findFirst({
    where: { id, usuarioId: userId },
  });

  if (!objetivo) {
    throw new AppError("GOAL_NOT_FOUND", "Objetivo nao encontrado.", 404);
  }

  await prisma.objetivo.delete({ where: { id } });
}

export async function aportarObjetivo(
  userId: string,
  id: string,
  valor: number
) {
  const objetivo = await prisma.objetivo.findFirst({
    where: { id, usuarioId: userId },
  });

  if (!objetivo) {
    throw new AppError("GOAL_NOT_FOUND", "Objetivo nao encontrado.", 404);
  }

  return prisma.$transaction(async (tx) => {
    await tx.aporte.create({
      data: {
        valor,
        objetivoId: id,
      },
    });

    return tx.objetivo.update({
      where: { id },
      data: {
        economizado: {
          increment: valor,
        },
      },
      include: {
        aportes: {
          orderBy: { data: "desc" },
        },
      },
    });
  });
}
