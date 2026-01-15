import { getAdminClient } from "../_shared/supabaseClient.ts";
import { gerarInsightsComGemini } from "../_shared/insights.ts";
import { corsResponse, handleError, jsonResponse } from "../_shared/responses.ts";

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
}) {
  const insights: Array<{ tipo: "controle" | "objetivo"; titulo: string; mensagem: string }> = [];
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
        mensagem:
          "Suas despesas ja passaram de 100% da remuneracao. Revise gastos e priorize essenciais.",
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const supabase = getAdminClient();
    const now = new Date();

    const { data: usuarios } = await supabase
      .from("Usuario")
      .select("id, remuneracao");

    for (const usuario of usuarios || []) {
      const { data: ativos } = await supabase
        .from("Insight")
        .select("tipo")
        .eq("usuarioId", usuario.id)
        .gt("expiraEm", now.toISOString());

      const tiposAtivos = new Set((ativos || []).map((item: any) => item.tipo));
      const tiposNecessarios: Array<"controle" | "objetivo"> = ["controle", "objetivo"];
      const tiposFaltando = tiposNecessarios.filter((tipo) => !tiposAtivos.has(tipo));

      if (!tiposFaltando.length) {
        continue;
      }

      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
      const { data: transacoes } = await supabase
        .from("Transacao")
        .select("tipo, valor, data")
        .eq("usuarioId", usuario.id)
        .gte("data", inicioMes.toISOString());

      const despesasMes = (transacoes || [])
        .filter((t: any) => t.tipo === "despesa")
        .reduce((acc: number, t: any) => acc + t.valor, 0);
      const receitasMes = (transacoes || [])
        .filter((t: any) => t.tipo === "receita")
        .reduce((acc: number, t: any) => acc + t.valor, 0);

      const { data: objetivoPrincipal } = await supabase
        .from("Objetivo")
        .select("nome, meta, economizado, dataLimite")
        .eq("usuarioId", usuario.id)
        .order("dataLimite", { ascending: true })
        .limit(1)
        .maybeSingle();

      const objetivoContexto = objetivoPrincipal
        ? {
            nome: objetivoPrincipal.nome,
            meta: objetivoPrincipal.meta,
            economizado: objetivoPrincipal.economizado,
            diasRestantes: Math.ceil(
              (new Date(objetivoPrincipal.dataLimite).getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24)
            ),
          }
        : undefined;

      const context = {
        remuneracao: usuario.remuneracao,
        despesasMes,
        receitasMes,
        saldoMes: receitasMes - despesasMes,
        objetivoPrincipal: objetivoContexto,
      };

      let insights =
        (await gerarInsightsComGemini(context)) ||
        buildFallbackInsights({
          remuneracao: context.remuneracao,
          despesasMes,
          receitasMes,
          objetivoPrincipal: objetivoContexto,
        });

      insights = insights.filter((item) => tiposFaltando.includes(item.tipo));
      if (!insights.length) {
        continue;
      }

      const expiraEm = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      await supabase.from("Insight").insert(
        insights.map((item) => ({
          ...item,
          usuarioId: usuario.id,
          expiraEm,
        }))
      );
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return handleError(err);
  }
});
