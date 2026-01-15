import { requireAuth } from "../_shared/auth.ts";
import { AppError } from "../_shared/errors.ts";
import { getAdminClient } from "../_shared/supabaseClient.ts";
import { corsResponse, handleError, jsonResponse, noContentResponse } from "../_shared/responses.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const payload = await requireAuth(req);
    const supabase = getAdminClient();
    const url = new URL(req.url);
    const rawPath = url.pathname.replace(/^\/notifications/, "");
    const path = rawPath === "" ? "/" : rawPath;

    if (req.method === "GET" && path === "/preferences") {
      const { data } = await supabase
        .from("Usuario")
        .select(
          "notificacoesPushObjetivos, notificacoesPushTransacoes, notificacoesEmailGerais, notificacoesEmailRelatorio"
        )
        .eq("id", payload.userId)
        .maybeSingle();

      if (!data) {
        throw new AppError("USER_NOT_FOUND", "Usuario nao encontrado.", 404);
      }
      return jsonResponse(data);
    }

    if (req.method === "PUT" && path === "/preferences") {
      const body = await req.json();
      await supabase
        .from("Usuario")
        .update({
          notificacoesPushObjetivos: body?.notificacoesPushObjetivos,
          notificacoesPushTransacoes: body?.notificacoesPushTransacoes,
          notificacoesEmailGerais: body?.notificacoesEmailGerais,
          notificacoesEmailRelatorio: body?.notificacoesEmailRelatorio,
        })
        .eq("id", payload.userId);

      return noContentResponse();
    }

    if (req.method === "POST" && path === "/push-token") {
      const body = await req.json();
      const token = String(body?.token || "").trim();
      if (!token) {
        throw new AppError("INVALID_PUSH_TOKEN", "Token invalido.", 400);
      }

      await supabase
        .from("Usuario")
        .update({ expoPushToken: token })
        .eq("id", payload.userId);

      return noContentResponse();
    }

    return jsonResponse({ error: "Rota nao encontrada.", code: "NOT_FOUND" }, 404);
  } catch (err) {
    return handleError(err);
  }
});
