import { prisma } from "../prisma/client";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  endOfDay
} from "date-fns";

export async function resumoPorCategoria(
  userId: string,
  periodo: string
) {
  let dataInicio: Date | undefined;
  let dataFim: Date | undefined;

  const agora = new Date();

  if (periodo === "mes") {
    dataInicio = startOfMonth(agora);
    dataFim = endOfMonth(agora);
  }

  if (periodo === "3meses") {
    dataInicio = startOfMonth(subMonths(agora, 2));
    dataFim = endOfDay(agora);
  }

  const transacoes = await prisma.transacao.findMany({
    where: {
      usuarioId: userId,
      tipo: "despesa",
      ...(dataInicio && dataFim && {
        data: {
          gte: dataInicio,
          lte: dataFim,
        },
      }),
    },
    include: { categoria: true },
  });

  const totalGeral = transacoes.reduce((acc, t) => acc + t.valor, 0);

  const agrupado = Object.values(
    transacoes.reduce((acc: any, t) => {
      const id = t.categoria.id;

      if (!acc[id]) {
        acc[id] = {
          id,
          label: t.categoria.nome,
          color: t.categoria.cor,
          valor: 0,
        };
      }

      acc[id].valor += t.valor;
      return acc;
    }, {})
  ).map((c: any) => ({
    ...c,
    percentual: totalGeral
      ? Math.round((c.valor / totalGeral) * 100)
      : 0,
  }));

  return agrupado;
}
