import { compare, hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { getAdminClient } from "./supabaseClient.ts";
import { AppError } from "./errors.ts";

const TWO_FACTOR_TTL_MINUTES = 10;

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createTwoFactorToken(
  userId: string,
  tipo: "login" | "enable" | "reset"
) {
  const code = generateCode();
  const codeHash = await hash(code);
  const expiresAt = new Date(Date.now() + TWO_FACTOR_TTL_MINUTES * 60 * 1000).toISOString();

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("TwoFactorToken")
    .insert({
      usuarioId: userId,
      codeHash,
      expiresAt,
      tipo,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new AppError(
      "TWO_FACTOR_CREATE_FAILED",
      "Nao foi possivel gerar o codigo.",
      500
    );
  }

  return { tokenId: data.id, code };
}

export async function verifyTwoFactorToken(
  tokenId: string,
  code: string,
  tipo: "login" | "enable" | "reset"
) {
  const supabase = getAdminClient();
  const { data: token, error } = await supabase
    .from("TwoFactorToken")
    .select("id, codeHash, expiresAt, tipo, usuarioId, usuario:usuarioId(id, email, twoFactorEnabled, nome, remuneracao, fotoPerfil)")
    .eq("id", tokenId)
    .maybeSingle();

  if (error || !token || token.tipo !== tipo) {
    throw new AppError("INVALID_2FA_CODE", "Codigo invalido.", 400);
  }

  if (new Date(token.expiresAt).getTime() < Date.now()) {
    await supabase.from("TwoFactorToken").delete().eq("id", tokenId);
    throw new AppError("EXPIRED_2FA_CODE", "Codigo expirado.", 400);
  }

  const valid = await compare(code, token.codeHash);
  if (!valid) {
    throw new AppError("INVALID_2FA_CODE", "Codigo invalido.", 400);
  }

  return token;
}
