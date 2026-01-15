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
    const rawPath = url.pathname.replace(/^\/categorias/, "");
    const path = rawPath === "" ? "/" : rawPath;

    if (req.method === "POST" && path === "/") {
      const body = await req.json();
      const nome = String(body?.nome || "").trim();
      const tipo = body?.tipo;
      const cor = body?.cor;

      if (!nome || !tipo || !cor) {
        throw new AppError("REQUIRED_FIELDS", "Preencha os campos obrigatorios.", 400);
      }

      const { data, error } = await supabase
        .from("Categoria")
        .insert({ nome, tipo, cor, usuarioId: payload.userId })
        .select("*")
        .single();

      if (error || !data) {
        throw new AppError("CATEGORY_CREATE_FAILED", "Nao foi possivel criar a categoria.", 500);
      }

      return jsonResponse(data, 201);
    }

    if (req.method === "GET" && path === "/") {
      const tipo = url.searchParams.get("tipo");
      let query = supabase
        .from("Categoria")
        .select("*")
        .eq("usuarioId", payload.userId)
        .order("nome", { ascending: true });

      if (tipo) {
        query = query.eq("tipo", tipo);
      }

      const { data, error } = await query;
      if (error) {
        throw new AppError("CATEGORY_LIST_FAILED", "Nao foi possivel listar categorias.", 500);
      }
      return jsonResponse(data || []);
    }

    const idMatch = path.match(/^\/([^/]+)$/);
    if (idMatch) {
      const id = idMatch[1];

      if (req.method === "GET") {
        const { data } = await supabase
          .from("Categoria")
          .select("*")
          .eq("id", id)
          .eq("usuarioId", payload.userId)
          .maybeSingle();

        if (!data) {
          throw new AppError("CATEGORY_NOT_FOUND", "Categoria nao encontrada.", 404);
        }
        return jsonResponse(data);
      }

      if (req.method === "PUT") {
        const body = await req.json();
        const { data, error } = await supabase
          .from("Categoria")
          .update(body)
          .eq("id", id)
          .eq("usuarioId", payload.userId)
          .select("*")
          .maybeSingle();

        if (error || !data) {
          throw new AppError("CATEGORY_NOT_FOUND", "Categoria nao encontrada.", 404);
        }
        return jsonResponse(data);
      }

      if (req.method === "DELETE") {
        const { error } = await supabase
          .from("Categoria")
          .delete()
          .eq("id", id)
          .eq("usuarioId", payload.userId);

        if (error) {
          throw new AppError("CATEGORY_NOT_FOUND", "Categoria nao encontrada.", 404);
        }
        return noContentResponse();
      }
    }

    return jsonResponse({ error: "Rota nao encontrada.", code: "NOT_FOUND" }, 404);
  } catch (err) {
    return handleError(err);
  }
});
