import { requireAuth } from "../_shared/auth.ts";
import { AppError } from "../_shared/errors.ts";
import { getAdminClient } from "../_shared/supabaseClient.ts";
import { corsResponse, handleError, jsonResponse, noContentResponse } from "../_shared/responses.ts";
import { notificarObjetivoCriado } from "../_shared/notificationEvents.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const payload = await requireAuth(req);
    const supabase = getAdminClient();
    const url = new URL(req.url);
    const rawPath = url.pathname.replace(/^\/objetivos/, "");
    const path = rawPath === "" ? "/" : rawPath;

    if (req.method === "POST" && path === "/") {
      const body = await req.json();
      const data = {
        nome: body?.nome,
        meta: Number(body?.meta),
        economizado: Number(body?.economizado ?? 0),
        dataLimite: body?.dataLimite ? new Date(body.dataLimite).toISOString() : null,
        usuarioId: payload.userId,
      };

      if (!data.nome || !Number.isFinite(data.meta) || !data.dataLimite) {
        throw new AppError("REQUIRED_FIELDS", "Preencha os campos obrigatorios.", 400);
      }

      const { data: created, error } = await supabase
        .from("Objetivo")
        .insert(data)
        .select("*")
        .single();

      if (error || !created) {
        throw new AppError("GOAL_CREATE_FAILED", "Nao foi possivel criar o objetivo.", 500);
      }

      try {
        await notificarObjetivoCriado({
          userId: payload.userId,
          nome: created.nome,
          meta: created.meta,
          dataLimite: new Date(created.dataLimite),
        });
      } catch {
        // best effort
      }

      return jsonResponse(created, 201);
    }

    if (req.method === "GET" && path === "/") {
      const { data, error } = await supabase
        .from("Objetivo")
        .select("*")
        .eq("usuarioId", payload.userId)
        .order("dataLimite", { ascending: true });

      if (error) {
        throw new AppError("GOAL_LIST_FAILED", "Nao foi possivel listar objetivos.", 500);
      }
      return jsonResponse(data || []);
    }

    const aporteMatch = path.match(/^\/([^/]+)\/aportar$/);
    if (aporteMatch && req.method === "POST") {
      const id = aporteMatch[1];
      const body = await req.json();
      const valor = Number(body?.valor);
      if (!Number.isFinite(valor)) {
        throw new AppError("INVALID_GOAL_DEPOSIT", "Informe um valor valido para o aporte.", 400);
      }

      const { data: objetivo } = await supabase
        .from("Objetivo")
        .select("id")
        .eq("id", id)
        .eq("usuarioId", payload.userId)
        .maybeSingle();

      if (!objetivo) {
        throw new AppError("GOAL_NOT_FOUND", "Objetivo nao encontrado.", 404);
      }

      const { data: aporte } = await supabase
        .from("Aporte")
        .insert({ valor, objetivoId: id })
        .select("id")
        .single();

      if (!aporte) {
        throw new AppError("GOAL_DEPOSIT_FAILED", "Nao foi possivel salvar o aporte.", 500);
      }

      const { data: objetivoAtual } = await supabase
        .from("Objetivo")
        .select("economizado")
        .eq("id", id)
        .eq("usuarioId", payload.userId)
        .maybeSingle();

      const novoEconomizado = (objetivoAtual?.economizado || 0) + valor;

      const { data: updated } = await supabase
        .from("Objetivo")
        .update({ economizado: novoEconomizado })
        .eq("id", id)
        .eq("usuarioId", payload.userId)
        .select("*, aportes:Aporte(*)")
        .maybeSingle();

      if (!updated) {
        throw new AppError("GOAL_UPDATE_FAILED", "Nao foi possivel atualizar o objetivo.", 500);
      }

      return jsonResponse(updated);
    }

    const idMatch = path.match(/^\/([^/]+)$/);
    if (idMatch) {
      const id = idMatch[1];

      if (req.method === "GET") {
        const { data } = await supabase
          .from("Objetivo")
          .select("*, aportes:Aporte(*)")
          .eq("id", id)
          .eq("usuarioId", payload.userId)
          .maybeSingle();

        if (!data) {
          throw new AppError("GOAL_NOT_FOUND", "Objetivo nao encontrado.", 404);
        }
        return jsonResponse(data);
      }

      if (req.method === "PUT") {
        const body = await req.json();
        const { data, error } = await supabase
          .from("Objetivo")
          .update(body)
          .eq("id", id)
          .eq("usuarioId", payload.userId)
          .select("*")
          .maybeSingle();

        if (error || !data) {
          throw new AppError("GOAL_NOT_FOUND", "Objetivo nao encontrado.", 404);
        }
        return jsonResponse(data);
      }

      if (req.method === "DELETE") {
        const { error } = await supabase
          .from("Objetivo")
          .delete()
          .eq("id", id)
          .eq("usuarioId", payload.userId);

        if (error) {
          throw new AppError("GOAL_NOT_FOUND", "Objetivo nao encontrado.", 404);
        }
        return noContentResponse();
      }
    }

    return jsonResponse({ error: "Rota nao encontrada.", code: "NOT_FOUND" }, 404);
  } catch (err) {
    return handleError(err);
  }
});
