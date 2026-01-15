import { requireAuth } from "../_shared/auth.ts";
import { AppError } from "../_shared/errors.ts";
import { getAdminClient } from "../_shared/supabaseClient.ts";
import { corsResponse, handleError, jsonResponse } from "../_shared/responses.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const payload = await requireAuth(req);
    const supabase = getAdminClient();
    const url = new URL(req.url);
    const rawPath = url.pathname.replace(/^\/dashboard/, "");
    const path = rawPath === "" ? "/" : rawPath;

    if (req.method === "GET" && path === "/resumo") {
      const mesRaw = url.searchParams.get("mes");
      const anoRaw = url.searchParams.get("ano");
      const mesNum = mesRaw ? Number(mesRaw) : NaN;
      const anoNum = anoRaw ? Number(anoRaw) : NaN;
      let baseDate = new Date();

      if (Number.isFinite(mesNum) && Number.isFinite(anoNum)) {
        const mes = mesNum >= 1 && mesNum <= 12 ? mesNum - 1 : mesNum;
        baseDate = new Date(anoNum, mes, 1);
      }

      const inicioMesAtual = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      const inicioMesSeguinte = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
      const inicioMesAnterior = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1);

      const { data: transacoes, error } = await supabase
        .from("Transacao")
        .select("valor, tipo, data")
        .eq("usuarioId", payload.userId);

      if (error) {
        throw new AppError("DASHBOARD_LOAD_FAILED", "Nao foi possivel carregar o resumo.", 500);
      }

      let receitas = 0;
      let despesasAtual = 0;
      let despesasAnterior = 0;

      (transacoes || []).forEach((t: any) => {
        const data = new Date(t.data);
        if (t.tipo === "receita" && data >= inicioMesAtual && data < inicioMesSeguinte) {
          receitas += t.valor;
        }
        if (t.tipo === "despesa") {
          if (data >= inicioMesAtual && data < inicioMesSeguinte) {
            despesasAtual += t.valor;
          }
          if (data >= inicioMesAnterior && data < inicioMesAtual) {
            despesasAnterior += t.valor;
          }
        }
      });

      let variacao = 0;
      if (despesasAnterior > 0) {
        variacao = Math.round(((despesasAtual - despesasAnterior) / despesasAnterior) * 100);
      }

      const agora = new Date().toISOString();
      const { data: insights } = await supabase
        .from("Insight")
        .select("*")
        .eq("usuarioId", payload.userId)
        .gt("expiraEm", agora)
        .order("criadoEm", { ascending: false })
        .limit(4);

      const { data: ultimasTransacoes } = await supabase
        .from("Transacao")
        .select("*")
        .eq("usuarioId", payload.userId)
        .order("data", { ascending: false })
        .limit(50);

      const { data: objetivos } = await supabase
        .from("Objetivo")
        .select("*")
        .eq("usuarioId", payload.userId)
        .order("dataLimite", { ascending: true });

      return jsonResponse({
        receitas,
        despesas: despesasAtual,
        despesasMesAnterior: despesasAnterior,
        variacaoDespesas: variacao,
        saldo: receitas - despesasAtual,
        insights: insights || [],
        ultimasTransacoes: ultimasTransacoes || [],
        objetivos: objetivos || [],
      });
    }

    return jsonResponse({ error: "Rota nao encontrada.", code: "NOT_FOUND" }, 404);
  } catch (err) {
    return handleError(err);
  }
});
