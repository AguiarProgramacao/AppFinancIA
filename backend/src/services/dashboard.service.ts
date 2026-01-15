import { prisma } from "../prisma/client";
import { addMonths, startOfMonth, subMonths } from "date-fns";

export async function resumoDashboard(
  userId: string,
  mes?: number,
  ano?: number
) {
  const baseDate =
    typeof mes === "number" && typeof ano === "number"
      ? new Date(ano, mes, 1)
      : new Date();
  const inicioMesAtual = startOfMonth(baseDate);
  const inicioMesSeguinte = startOfMonth(addMonths(baseDate, 1));
  const inicioMesAnterior = startOfMonth(subMonths(baseDate, 1));

  const receitas = await prisma.transacao.aggregate({
    where: {
      usuarioId: userId,
      tipo: "receita",
      data: {
        gte: inicioMesAtual,
        lt: inicioMesSeguinte,
      },
    },
    _sum: { valor: true },
  });

  const despesasMesAtual = await prisma.transacao.aggregate({
    where: {
      usuarioId: userId,
      tipo: "despesa",
      data: { gte: inicioMesAtual, lt: inicioMesSeguinte },
    },
    _sum: { valor: true },
  });

  const despesasMesAnterior = await prisma.transacao.aggregate({
    where: {
      usuarioId: userId,
      tipo: "despesa",
      data: {
        gte: inicioMesAnterior,
        lt: inicioMesAtual,
      },
    },
    _sum: { valor: true },
  });

  const atual = despesasMesAtual._sum.valor || 0;
  const anterior = despesasMesAnterior._sum.valor || 0;

  let variacao = 0;
  if (anterior > 0) {
    variacao = Math.round(((atual - anterior) / anterior) * 100);
  }

  const agora = new Date();
  const insights = await prisma.insight.findMany({
    where: {
      usuarioId: userId,
      expiraEm: { gt: agora },
    },
    orderBy: { criadoEm: "desc" },
    take: 4,
  });

  const ultimasTransacoes = await prisma.transacao.findMany({
    where: { usuarioId: userId },
    orderBy: { data: "desc" },
    take: 50,
  });

  const objetivos = await prisma.objetivo.findMany({
    where: { usuarioId: userId },
    orderBy: { dataLimite: "asc" },
  });

  return {
    receitas: receitas._sum.valor || 0,
    despesas: atual,
    despesasMesAnterior: anterior,
    variacaoDespesas: variacao,
    saldo:
      (receitas._sum.valor || 0) - atual,
    insights,
    ultimasTransacoes,
    objetivos,
  };
}
