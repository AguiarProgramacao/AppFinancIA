import { requireAuth } from "../_shared/auth.ts";
import { AppError } from "../_shared/errors.ts";
import { getAdminClient } from "../_shared/supabaseClient.ts";
import { corsResponse, handleError, jsonResponse, noContentResponse } from "../_shared/responses.ts";
import { createTwoFactorToken, verifyTwoFactorToken } from "../_shared/twoFactor.ts";
import { sendTwoFactorEmail } from "../_shared/email.ts";
import { hashPassword, verifyPassword } from "../_shared/crypto.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const payload = await requireAuth(req);
    const supabase = getAdminClient();
    const url = new URL(req.url);
    const rawPath = url.pathname.replace(/^\/security/, "");
    const path = rawPath === "" ? "/" : rawPath;

    if (req.method === "GET" && path === "/status") {
      const { data } = await supabase
        .from("Usuario")
        .select("twoFactorEnabled, twoFactorEmail")
        .eq("id", payload.userId)
        .maybeSingle();

      if (!data) {
        throw new AppError("USER_NOT_FOUND", "Usuario nao encontrado.", 404);
      }

      return jsonResponse(data);
    }

    if (req.method === "POST" && path === "/password") {
      const body = await req.json();
      const senhaAtual = String(body?.senhaAtual || "");
      const novaSenha = String(body?.novaSenha || "");
      if (!novaSenha || novaSenha.length < 6) {
        throw new AppError(
          "PASSWORD_TOO_SHORT",
          "A senha deve ter pelo menos 6 caracteres.",
          400
        );
      }

      const { data: user } = await supabase
        .from("Usuario")
        .select("senha")
        .eq("id", payload.userId)
        .maybeSingle();

      if (!user) {
        throw new AppError("USER_NOT_FOUND", "Usuario nao encontrado.", 404);
      }

      const valid = await verifyPassword(senhaAtual, user.senha);
      if (!valid) {
        throw new AppError("INVALID_PASSWORD", "Senha atual incorreta.", 400);
      }

      const senhaHash = await hashPassword(novaSenha);
      await supabase
        .from("Usuario")
        .update({ senha: senhaHash })
        .eq("id", payload.userId);

      return noContentResponse();
    }

    if (req.method === "POST" && path === "/2fa/request") {
      const { data: user } = await supabase
        .from("Usuario")
        .select("id, email, twoFactorEnabled")
        .eq("id", payload.userId)
        .maybeSingle();

      if (!user) {
        throw new AppError("USER_NOT_FOUND", "Usuario nao encontrado.", 404);
      }
      if (user.twoFactorEnabled) {
        throw new AppError(
          "TWO_FACTOR_ALREADY_ENABLED",
          "A autenticacao em duas etapas ja esta ativa.",
          400
        );
      }

      await supabase
        .from("TwoFactorToken")
        .delete()
        .eq("usuarioId", payload.userId)
        .eq("tipo", "enable");

      const { tokenId, code } = await createTwoFactorToken(payload.userId, "enable");
      await sendTwoFactorEmail(user.email, code, "enable");

      return jsonResponse({ tokenId, email: user.email });
    }

    if (req.method === "POST" && path === "/2fa/confirm") {
      const body = await req.json();
      const tokenId = String(body?.tokenId || "");
      const code = String(body?.code || "");

      const token = await verifyTwoFactorToken(tokenId, code, "enable");
      if (token.usuarioId !== payload.userId) {
        throw new AppError("INVALID_2FA_CODE", "Codigo invalido.", 400);
      }

      await supabase.from("TwoFactorToken").delete().eq("id", tokenId);
      await supabase
        .from("Usuario")
        .update({ twoFactorEnabled: true, twoFactorEmail: true })
        .eq("id", payload.userId);

      return noContentResponse();
    }

    if (req.method === "POST" && path === "/2fa/disable") {
      const body = await req.json();
      const senhaAtual = String(body?.senhaAtual || "");

      const { data: user } = await supabase
        .from("Usuario")
        .select("senha")
        .eq("id", payload.userId)
        .maybeSingle();

      if (!user) {
        throw new AppError("USER_NOT_FOUND", "Usuario nao encontrado.", 404);
      }

      const valid = await verifyPassword(senhaAtual, user.senha);
      if (!valid) {
        throw new AppError("INVALID_PASSWORD", "Senha atual incorreta.", 400);
      }

      await supabase
        .from("Usuario")
        .update({ twoFactorEnabled: false, twoFactorEmail: false })
        .eq("id", payload.userId);

      await supabase.from("TwoFactorToken").delete().eq("usuarioId", payload.userId);
      return noContentResponse();
    }

    if (req.method === "GET" && path === "/sessions") {
      const { data: sessions } = await supabase
        .from("Sessao")
        .select("*")
        .eq("usuarioId", payload.userId)
        .is("revogadoEm", null)
        .order("ultimoAcesso", { ascending: false });

      return jsonResponse({
        currentSessionId: payload.sessionId,
        sessions: sessions || [],
      });
    }

    const revokeMatch = path.match(/^\/sessions\/revoke\/([^/]+)$/);
    if (revokeMatch && req.method === "POST") {
      const sessionId = revokeMatch[1];
      const { data: session } = await supabase
        .from("Sessao")
        .select("id")
        .eq("id", sessionId)
        .eq("usuarioId", payload.userId)
        .is("revogadoEm", null)
        .maybeSingle();

      if (!session) {
        throw new AppError("SESSION_NOT_FOUND", "Sessao nao encontrada.", 404);
      }

      await supabase
        .from("Sessao")
        .update({ revogadoEm: new Date().toISOString() })
        .eq("id", sessionId);

      return noContentResponse();
    }

    if (req.method === "POST" && path === "/sessions/revoke-others") {
      await supabase
        .from("Sessao")
        .update({ revogadoEm: new Date().toISOString() })
        .eq("usuarioId", payload.userId)
        .neq("id", payload.sessionId)
        .is("revogadoEm", null);

      return noContentResponse();
    }

    return jsonResponse({ error: "Rota nao encontrada.", code: "NOT_FOUND" }, 404);
  } catch (err) {
    return handleError(err);
  }
});
