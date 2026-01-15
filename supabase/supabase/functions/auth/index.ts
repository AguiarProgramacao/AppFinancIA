import { handleError, corsResponse, jsonResponse, noContentResponse } from "../_shared/responses.ts";
import { AppError } from "../_shared/errors.ts";
import { getAdminClient } from "../_shared/supabaseClient.ts";
import { hashPassword, verifyPassword } from "../_shared/crypto.ts";
import { createTwoFactorToken, verifyTwoFactorToken } from "../_shared/twoFactor.ts";
import { sendTwoFactorEmail } from "../_shared/email.ts";
import { requireAuth, signToken } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsResponse();
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/auth/, "");
    const supabase = getAdminClient();

    if (req.method === "POST" && path === "/register") {
      const body = await req.json();
      const nome = String(body?.nome || "").trim();
      const email = String(body?.email || "").trim();
      const senha = String(body?.senha || "");

      if (!nome || !email || !senha) {
        throw new AppError("REQUIRED_FIELDS", "Preencha todos os campos.", 400);
      }

      const { data: exists } = await supabase
        .from("Usuario")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (exists) {
        throw new AppError("EMAIL_ALREADY_EXISTS", "E-mail ja cadastrado.", 409);
      }

      const senhaHash = await hashPassword(senha);
      const { data: user, error } = await supabase
        .from("Usuario")
        .insert({ nome, email, senha: senhaHash })
        .select("id, nome, email, remuneracao, fotoPerfil")
        .single();

      if (error || !user) {
        throw new AppError("USER_CREATE_FAILED", "Nao foi possivel criar o usuario.", 500);
      }

      return jsonResponse(user, 201);
    }

    if (req.method === "POST" && path === "/login") {
      const body = await req.json();
      const email = String(body?.email || "").trim();
      const senha = String(body?.senha || "");
      const deviceName = String(body?.deviceName || "").trim();

      const { data: user } = await supabase
        .from("Usuario")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (!user) {
        throw new AppError("INVALID_CREDENTIALS", "E-mail ou senha invalidos.", 401);
      }

      const valid = await verifyPassword(senha, user.senha);
      if (!valid) {
        throw new AppError("INVALID_CREDENTIALS", "E-mail ou senha invalidos.", 401);
      }

      if (user.twoFactorEnabled) {
        await supabase
          .from("TwoFactorToken")
          .delete()
          .eq("usuarioId", user.id)
          .eq("tipo", "login");

        const { tokenId, code } = await createTwoFactorToken(user.id, "login");
        await sendTwoFactorEmail(user.email, code, "login");

        return jsonResponse({
          requiresTwoFactor: true,
          twoFactorTokenId: tokenId,
          email: maskEmail(user.email),
        });
      }

      const { data: session } = await supabase
        .from("Sessao")
        .insert({
          usuarioId: user.id,
          userAgent: deviceName || req.headers.get("user-agent"),
          ip: req.headers.get("x-forwarded-for") || null,
        })
        .select("id")
        .single();

      if (!session) {
        throw new AppError("SESSION_CREATE_FAILED", "Nao foi possivel criar a sessao.", 500);
      }

      const token = await signToken(user.id, session.id);
      return jsonResponse({
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          remuneracao: user.remuneracao,
          fotoPerfil: user.fotoPerfil,
        },
      });
    }

    if (req.method === "POST" && path === "/verify-2fa") {
      const body = await req.json();
      const tokenId = String(body?.tokenId || "");
      const code = String(body?.code || "");
      const deviceName = String(body?.deviceName || "").trim();

      const token = await verifyTwoFactorToken(tokenId, code, "login");

      if (!token.usuario?.twoFactorEnabled) {
        throw new AppError(
          "TWO_FACTOR_DISABLED",
          "A autenticacao em duas etapas esta desativada.",
          400
        );
      }

      await supabase.from("TwoFactorToken").delete().eq("id", tokenId);

      const { data: session } = await supabase
        .from("Sessao")
        .insert({
          usuarioId: token.usuario.id,
          userAgent: deviceName || req.headers.get("user-agent"),
          ip: req.headers.get("x-forwarded-for") || null,
        })
        .select("id")
        .single();

      if (!session) {
        throw new AppError("SESSION_CREATE_FAILED", "Nao foi possivel criar a sessao.", 500);
      }

      const jwtToken = await signToken(token.usuario.id, session.id);
      return jsonResponse({
        token: jwtToken,
        user: {
          id: token.usuario.id,
          nome: token.usuario.nome,
          email: token.usuario.email,
          remuneracao: token.usuario.remuneracao,
          fotoPerfil: token.usuario.fotoPerfil,
        },
      });
    }

    if (req.method === "POST" && path === "/forgot-password") {
      const body = await req.json();
      const email = String(body?.email || "").trim();
      if (!email) {
        throw new AppError("EMAIL_REQUIRED", "E-mail obrigatorio.", 400);
      }

      const { data: user } = await supabase
        .from("Usuario")
        .select("id, email")
        .eq("email", email)
        .maybeSingle();

      if (!user) {
        return jsonResponse({ tokenId: null, email: maskEmail(email) });
      }

      await supabase
        .from("TwoFactorToken")
        .delete()
        .eq("usuarioId", user.id)
        .eq("tipo", "reset");

      const { tokenId, code } = await createTwoFactorToken(user.id, "reset");
      await sendTwoFactorEmail(user.email, code, "reset");

      return jsonResponse({ tokenId, email: maskEmail(user.email) });
    }

    if (req.method === "POST" && path === "/reset-password") {
      const body = await req.json();
      const tokenId = String(body?.tokenId || "");
      const code = String(body?.code || "");
      const novaSenha = String(body?.novaSenha || "");

      if (!tokenId || !code || !novaSenha) {
        throw new AppError(
          "RESET_PASSWORD_REQUIRED_FIELDS",
          "Informe token, codigo e nova senha.",
          400
        );
      }
      if (novaSenha.length < 6) {
        throw new AppError("PASSWORD_TOO_SHORT", "A senha deve ter pelo menos 6 caracteres.", 400);
      }

      const token = await verifyTwoFactorToken(tokenId, code, "reset");
      const senhaHash = await hashPassword(novaSenha);

      await supabase
        .from("Usuario")
        .update({ senha: senhaHash })
        .eq("id", token.usuarioId);

      await supabase
        .from("TwoFactorToken")
        .delete()
        .eq("usuarioId", token.usuarioId)
        .eq("tipo", "reset");

      await supabase
        .from("Sessao")
        .update({ revogadoEm: new Date().toISOString() })
        .eq("usuarioId", token.usuarioId);

      return noContentResponse();
    }

    if (req.method === "POST" && path === "/logout") {
      const payload = await requireAuth(req);
      await supabase
        .from("Sessao")
        .update({ revogadoEm: new Date().toISOString() })
        .eq("id", payload.sessionId);
      return noContentResponse();
    }

    return jsonResponse({ error: "Rota nao encontrada.", code: "NOT_FOUND" }, 404);
  } catch (err) {
    return handleError(err);
  }
});

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}***@${domain}`;
}
