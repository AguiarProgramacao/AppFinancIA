import { requireAuth } from "../_shared/auth.ts";
import { AppError } from "../_shared/errors.ts";
import { getAdminClient } from "../_shared/supabaseClient.ts";
import { corsResponse, handleError, jsonResponse, noContentResponse } from "../_shared/responses.ts";
import { notificarTransacaoCriada } from "../_shared/notificationEvents.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const payload = await requireAuth(req);
    const supabase = getAdminClient();
    const url = new URL(req.url);
    const rawPath = url.pathname.replace(/^\/transacoes/, "");
    const path = rawPath === "" ? "/" : rawPath;

    if (req.method === "POST" && path === "/") {
      const body = await req.json();
      const data = {
        tipo: body?.tipo,
        valor: Number(body?.valor),
        descricao: body?.descricao ?? null,
        data: body?.data ? new Date(body.data).toISOString() : null,
        formaPagamento: body?.formaPagamento ?? null,
        observacoes: body?.observacoes ?? null,
        categoriaId: body?.categoriaId,
        usuarioId: payload.userId,
      };

      if (
        !data.tipo ||
        !Number.isFinite(data.valor) ||
        !data.data ||
        !data.categoriaId
      ) {
        throw new AppError("REQUIRED_FIELDS", "Preencha os campos obrigatorios.", 400);
      }

      await validarCategoria(supabase, payload.userId, data.categoriaId);

      const { data: created, error } = await supabase
        .from("Transacao")
        .insert(data)
        .select("*")
        .single();

      if (error || !created) {
        throw new AppError("TRANSACTION_CREATE_FAILED", "Nao foi possivel criar a transacao.", 500);
      }

      try {
        await notificarTransacaoCriada({
          userId: payload.userId,
          tipo: created.tipo === "despesa" ? "despesa" : "receita",
          valor: created.valor,
          descricao: created.descricao,
        });
      } catch {
        // best effort
      }

      return jsonResponse(created, 201);
    }

    if (req.method === "GET" && path === "/") {
      const mesRaw = url.searchParams.get("mes");
      const anoRaw = url.searchParams.get("ano");
      const mesNum = mesRaw ? Number(mesRaw) : NaN;
      const anoNum = anoRaw ? Number(anoRaw) : NaN;
      let start: Date | undefined;
      let end: Date | undefined;

      if (Number.isFinite(mesNum) && Number.isFinite(anoNum)) {
        const mes = mesNum >= 1 && mesNum <= 12 ? mesNum - 1 : mesNum;
        start = new Date(anoNum, mes, 1);
        end = new Date(anoNum, mes + 1, 1);
      }

      let query = supabase
        .from("Transacao")
        .select("*, categoria:categoriaId(*)")
        .eq("usuarioId", payload.userId)
        .order("data", { ascending: false });

      if (start && end) {
        query = query.gte("data", start.toISOString()).lt("data", end.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        throw new AppError("TRANSACTION_LIST_FAILED", "Nao foi possivel listar transacoes.", 500);
      }
      return jsonResponse(data || []);
    }

    const idMatch = path.match(/^\/([^/]+)$/);
    if (idMatch) {
      const id = idMatch[1];

      if (req.method === "GET") {
        const { data } = await supabase
          .from("Transacao")
          .select("*, categoria:categoriaId(*)")
          .eq("id", id)
          .eq("usuarioId", payload.userId)
          .maybeSingle();

        if (!data) {
          throw new AppError("TRANSACTION_NOT_FOUND", "Transacao nao encontrada.", 404);
        }
        return jsonResponse(data);
      }

      if (req.method === "PUT") {
        const body = await req.json();
        if (body?.categoriaId) {
          await validarCategoria(supabase, payload.userId, body.categoriaId);
        }

        const { data, error } = await supabase
          .from("Transacao")
          .update(body)
          .eq("id", id)
          .eq("usuarioId", payload.userId)
          .select("*, categoria:categoriaId(*)")
          .maybeSingle();

        if (error || !data) {
          throw new AppError("TRANSACTION_NOT_FOUND", "Transacao nao encontrada.", 404);
        }

        return jsonResponse(data);
      }

      if (req.method === "DELETE") {
        const { error } = await supabase
          .from("Transacao")
          .delete()
          .eq("id", id)
          .eq("usuarioId", payload.userId);

        if (error) {
          throw new AppError("TRANSACTION_NOT_FOUND", "Transacao nao encontrada.", 404);
        }

        return noContentResponse();
      }
    }

    return jsonResponse({ error: "Rota nao encontrada.", code: "NOT_FOUND" }, 404);
  } catch (err) {
    return handleError(err);
  }
});

async function validarCategoria(
  supabase: ReturnType<typeof getAdminClient>,
  userId: string,
  categoriaId: string
) {
  const { data } = await supabase
    .from("Categoria")
    .select("id")
    .eq("id", categoriaId)
    .eq("usuarioId", userId)
    .maybeSingle();

  if (!data) {
    throw new AppError("CATEGORY_NOT_FOUND", "Categoria nao encontrada.", 404);
  }
}
