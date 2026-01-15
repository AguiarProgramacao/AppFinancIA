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
    const rawPath = url.pathname.replace(/^\/graficos/, "");
    const path = rawPath === "" ? "/" : rawPath;

    if (req.method === "GET" && path === "/categorias") {
      const periodo = String(url.searchParams.get("periodo") || "todos");
      const now = new Date();
      let start: Date | undefined;
      let end: Date | undefined;

      if (periodo === "mes") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      } else if (periodo === "3meses") {
        start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      }

      let query = supabase
        .from("Transacao")
        .select("valor, categoria:categoriaId(id, nome, cor)")
        .eq("usuarioId", payload.userId)
        .eq("tipo", "despesa");

      if (start && end) {
        query = query.gte("data", start.toISOString()).lt("data", end.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        throw new AppError("CHARTS_FAILED", "Nao foi possivel gerar o grafico.", 500);
      }

      const totalGeral = (data || []).reduce(
        (acc: number, t: any) => acc + t.valor,
        0
      );

      const grouped: Record<string, any> = {};
      (data || []).forEach((t: any) => {
        const categoria = t.categoria;
        if (!categoria) return;
        if (!grouped[categoria.id]) {
          grouped[categoria.id] = {
            id: categoria.id,
            label: categoria.nome,
            color: categoria.cor,
            valor: 0,
          };
        }
        grouped[categoria.id].valor += t.valor;
      });

      const result = Object.values(grouped).map((c: any) => ({
        ...c,
        percentual: totalGeral ? Math.round((c.valor / totalGeral) * 100) : 0,
      }));

      return jsonResponse(result);
    }

    return jsonResponse({ error: "Rota nao encontrada.", code: "NOT_FOUND" }, 404);
  } catch (err) {
    return handleError(err);
  }
});
