import { addHours, differenceInCalendarDays, startOfMonth } from "date-fns";
import { prisma } from "../prisma/client";
import { gerarInsightsComGemini } from "./gemini.service";

interface InsightInput {
  tipo: "controle" | "objetivo";
  titulo: string;
  mensagem: string;
}

function formatMoney(valor: number) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function buildFallbackInsights(params: {
  remuneracao: number;
  despesasMes: number;
  receitasMes: number;
  objetivoPrincipal?: {
    nome: string;
    meta: number;
    economizado: number;
    diasRestantes: number;
  };
}): InsightInput[] {
  const insights: InsightInput[] = [];
  const { remuneracao, despesasMes, receitasMes, objetivoPrincipal } = params;

  if (remuneracao <= 0) {
    insights.push({
      tipo: "controle",
      titulo: "Defina sua remuneracao",
      mensagem:
        "Para ter um controle financeiro melhor, informe sua remuneracao mensal no perfil.",
    });
  } else {
    const percentual = (despesasMes / remuneracao) * 100;
    if (percentual >= 100) {
      insights.push({
        tipo: "controle",
        titulo: "Gastos acima da remuneracao",
        mensagem: `Suas despesas ja passaram de 100% da remuneracao. Revise gastos e priorize essenciais.`,
      });
    } else if (percentual >= 80) {
      insights.push({
        tipo: "controle",
        titulo: "Atencao com os gastos",
        mensagem: `Voce ja usou ${Math.round(
          percentual
        )}% da remuneracao no mes. Tente reduzir despesas nao essenciais.`,
      });
    } else if (percentual <= 50) {
      insights.push({
        tipo: "controle",
        titulo: "Bom controle financeiro",
        mensagem: `Voce usou apenas ${Math.round(
          percentual
        )}% da remuneracao no mes. Mantenha o ritmo para fortalecer a reserva.`,
      });
    } else {
      insights.push({
        tipo: "controle",
        titulo: "Controle financeiro equilibrado",
        mensagem: `Voce usou ${Math.round(
          percentual
        )}% da remuneracao no mes. Ainda ha margem para poupar.`,
      });
    }
  }

  if (!objetivoPrincipal) {
    insights.push({
      tipo: "objetivo",
      titulo: "Defina um objetivo",
      mensagem:
        "Crie um objetivo financeiro para acompanhar seu progresso e manter o foco.",
    });
    return insights;
  }

  const restante = objetivoPrincipal.meta - objetivoPrincipal.economizado;
  if (restante <= 0) {
    insights.push({
      tipo: "objetivo",
      titulo: "Objetivo concluido",
      mensagem: `Parabens! Voce concluiu o objetivo ${objetivoPrincipal.nome}.`,
    });
    return insights;
  }

  if (objetivoPrincipal.diasRestantes <= 0) {
    insights.push({
      tipo: "objetivo",
      titulo: "Objetivo atrasado",
      mensagem: `O prazo do objetivo ${objetivoPrincipal.nome} passou. Ajuste a meta ou o prazo.`,
    });
    return insights;
  }

  const mesesRestantes = Math.max(1, Math.ceil(objetivoPrincipal.diasRestantes / 30));
  const aporteMensal = restante / mesesRestantes;
  if (remuneracao > 0 && aporteMensal > remuneracao * 0.3) {
    insights.push({
      tipo: "objetivo",
      titulo: "Aporte alto para o objetivo",
      mensagem: `Para atingir ${objetivoPrincipal.nome}, sera preciso poupar cerca de R$ ${formatMoney(
        aporteMensal
      )} por mes, acima de 30% da remuneracao.`,
    });
  } else {
    insights.push({
      tipo: "objetivo",
      titulo: "Progresso do objetivo",
      mensagem: `Faltam R$ ${formatMoney(
        restante
      )} para ${objetivoPrincipal.nome}. Reserve R$ ${formatMoney(
        aporteMensal
      )} por mes para chegar no prazo.`,
    });
  }

  return insights;
}

export async function gerarInsightsParaUsuario(userId: string) {
  const now = new Date();
  const ativos = await prisma.insight.findMany({
    where: { usuarioId: userId, expiraEm: { gt: now } },
    select: { tipo: true },
  });

  const tiposAtivos = new Set(ativos.map((item) => item.tipo));
  const tiposNecessarios: InsightInput["tipo"][] = ["controle", "objetivo"];
  const tiposFaltando = tiposNecessarios.filter(
    (tipo) => !tiposAtivos.has(tipo)
  );

  if (!tiposFaltando.length) {
    return;
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { remuneracao: true },
  });

  if (!usuario) {
    return;
  }

  const inicioMes = startOfMonth(now);
  const despesasMes = await prisma.transacao.aggregate({
    where: {
      usuarioId: userId,
      tipo: "despesa",
      data: { gte: inicioMes },
    },
    _sum: { valor: true },
  });

  const receitasMes = await prisma.transacao.aggregate({
    where: {
      usuarioId: userId,
      tipo: "receita",
      data: { gte: inicioMes },
    },
    _sum: { valor: true },
  });

  const objetivoPrincipal = await prisma.objetivo.findFirst({
    where: { usuarioId: userId },
    orderBy: { dataLimite: "asc" },
  });

  const objetivoContexto = objetivoPrincipal
    ? {
        nome: objetivoPrincipal.nome,
        meta: objetivoPrincipal.meta,
        economizado: objetivoPrincipal.economizado,
        diasRestantes: differenceInCalendarDays(
          objetivoPrincipal.dataLimite,
          now
        ),
      }
    : undefined;

  const context = {
    remuneracao: usuario.remuneracao,
    despesasMes: despesasMes._sum.valor || 0,
    receitasMes: receitasMes._sum.valor || 0,
    saldoMes: (receitasMes._sum.valor || 0) - (despesasMes._sum.valor || 0),
    objetivoPrincipal: objetivoContexto,
  };

  let insights =
    (await gerarInsightsComGemini(context)) ||
    buildFallbackInsights({
      remuneracao: context.remuneracao,
      despesasMes: context.despesasMes,
      receitasMes: context.receitasMes,
      objetivoPrincipal: objetivoContexto,
    });

  insights = insights.filter((item) => tiposFaltando.includes(item.tipo));
  if (!insights.length) {
    return;
  }

  const expiraEm = addHours(now, 24);
  await prisma.insight.createMany({
    data: insights.map((item) => ({
      ...item,
      usuarioId: userId,
      expiraEm,
    })),
  });
}
