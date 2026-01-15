import { prisma } from "../prisma/client";
import { AppError } from "../utils/appError";

interface CreateCategoriaDTO {
  nome: string;
  tipo: "despesa" | "receita";
  cor: string;
}

export function criarCategoria(userId: string, data: CreateCategoriaDTO) {
  return prisma.categoria.create({
    data: {
      ...data,
      usuarioId: userId,
    },
  });
}

export function listarCategorias(userId: string, tipo?: string) {
  return prisma.categoria.findMany({
    where: {
      usuarioId: userId,
      ...(tipo ? { tipo } : {}),
    },
    orderBy: { nome: "asc" },
  });
}

export function buscarCategoriaPorId(userId: string, id: string) {
  return prisma.categoria.findFirst({
    where: { id, usuarioId: userId },
  });
}

export async function atualizarCategoria(
  userId: string,
  id: string,
  data: Partial<CreateCategoriaDTO>
) {
  const categoria = await prisma.categoria.findFirst({
    where: { id, usuarioId: userId },
  });
  if (!categoria) {
    throw new AppError("CATEGORY_NOT_FOUND", "Categoria nao encontrada.", 404);
  }
  return prisma.categoria.update({
    where: { id },
    data,
  });
}

export async function deletarCategoria(userId: string, id: string) {
  const categoria = await prisma.categoria.findFirst({
    where: { id, usuarioId: userId },
  });
  if (!categoria) {
    throw new AppError("CATEGORY_NOT_FOUND", "Categoria nao encontrada.", 404);
  }
  await prisma.categoria.delete({ where: { id } });
}

export async function validarCategoriaDoUsuario(userId: string, id: string) {
  const categoria = await prisma.categoria.findFirst({
    where: { id, usuarioId: userId },
  });
  if (!categoria) {
    throw new AppError("CATEGORY_NOT_FOUND", "Categoria nao encontrada.", 404);
  }
  return categoria;
}
