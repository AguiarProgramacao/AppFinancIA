import { addMonths, startOfMonth } from "date-fns";
import { prisma } from "../prisma/client";
import { validarCategoriaDoUsuario } from "./categoria.service";
import { AppError } from "../utils/appError";

interface CreateTransacaoDTO {
  tipo: "despesa" | "receita";
  valor: number;
  descricao?: string;
  data: Date;
  formaPagamento?: string;
  observacoes?: string;
  categoriaId: string;
}

export async function criarTransacao(
  userId: string,
  data: CreateTransacaoDTO
) {
  await validarCategoriaDoUsuario(userId, data.categoriaId);
  return prisma.transacao.create({
    data: {
      ...data,
      usuarioId: userId,
    },
  });
}

export function listarTransacoes(
  userId: string,
  mes?: number,
  ano?: number
) {
  const filtroData =
    typeof mes === "number" && typeof ano === "number"
      ? {
          gte: startOfMonth(new Date(ano, mes, 1)),
          lt: startOfMonth(addMonths(new Date(ano, mes, 1), 1)),
        }
      : undefined;

  return prisma.transacao.findMany({
    where: {
      usuarioId: userId,
      ...(filtroData ? { data: filtroData } : {}),
    },
    include: { categoria: true },
    orderBy: { data: "desc" },
  });
}

export async function buscarTransacaoPorId(
  userId: string,
  id: string
) {
  return prisma.transacao.findFirst({
    where: {
      id,
      usuarioId: userId,
    },
    include: {
      categoria: true,
    },
  });
}

export async function atualizarTransacao(
  userId: string,
  id: string,
  data: Partial<CreateTransacaoDTO>
) {
  const existe = await prisma.transacao.findFirst({
    where: { id, usuarioId: userId },
  });

  if (!existe) {
    throw new AppError("TRANSACTION_NOT_FOUND", "Transacao nao encontrada.", 404);
  }

  if (data.categoriaId) {
    await validarCategoriaDoUsuario(userId, data.categoriaId);
  }

  return prisma.transacao.update({
    where: { id },
    data,
  });
}

export async function deletarTransacao(
  userId: string,
  id: string
) {
  const existe = await prisma.transacao.findFirst({
    where: { id, usuarioId: userId },
  });

  if (!existe) {
    throw new AppError("TRANSACTION_NOT_FOUND", "Transacao nao encontrada.", 404);
  }

  await prisma.transacao.delete({
    where: { id },
  });
}
