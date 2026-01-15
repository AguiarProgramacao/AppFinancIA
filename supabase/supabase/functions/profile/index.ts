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
    const rawPath = url.pathname.replace(/^\/profile/, "");
    const path = rawPath === "" ? "/" : rawPath;

    if (req.method === "GET" && path === "/") {
      const { data } = await supabase
        .from("Usuario")
        .select("id, nome, email, remuneracao, fotoPerfil")
        .eq("id", payload.userId)
        .maybeSingle();

      if (!data) {
        throw new AppError("USER_NOT_FOUND", "Usuario nao encontrado.", 404);
      }
      return jsonResponse(data);
    }

    if (req.method === "PUT" && path === "/") {
      const body = await req.json();
      const remuneracao = body?.remuneracao;
      if (remuneracao !== undefined && Number.isNaN(Number(remuneracao))) {
        throw new AppError("INVALID_REMUNERATION", "Remuneracao invalida.", 400);
      }

      const { data } = await supabase
        .from("Usuario")
        .update({
          nome: body?.nome?.trim(),
          remuneracao: remuneracao !== undefined ? Number(remuneracao) : undefined,
          fotoPerfil: body?.fotoPerfil ?? undefined,
        })
        .eq("id", payload.userId)
        .select("id, nome, email, remuneracao, fotoPerfil")
        .maybeSingle();

      if (!data) {
        throw new AppError("USER_NOT_FOUND", "Usuario nao encontrado.", 404);
      }

      return jsonResponse(data);
    }

    return jsonResponse({ error: "Rota nao encontrada.", code: "NOT_FOUND" }, 404);
  } catch (err) {
    return handleError(err);
  }
});
