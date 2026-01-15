import { jwtVerify, SignJWT } from "npm:jose@5.3.0";
import { getAdminClient } from "./supabaseClient.ts";
import { AppError } from "./errors.ts";

interface TokenPayload {
  userId: string;
  sessionId: string;
}

function getJwtSecret() {
  const secret = Deno.env.get("JWT_SECRET");
  if (!secret) {
    throw new Error("JWT_SECRET not configured");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(userId: string, sessionId: string) {
  const secret = getJwtSecret();
  return await new SignJWT({ userId, sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function requireAuth(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    throw new AppError("TOKEN_MISSING", "Token nao informado.", 401);
  }
  const [, token] = authHeader.split(" ");
  if (!token) {
    throw new AppError("TOKEN_MISSING", "Token nao informado.", 401);
  }

  let payload: TokenPayload;
  try {
    const result = await jwtVerify(token, getJwtSecret());
    payload = result.payload as TokenPayload;
  } catch {
    throw new AppError(
      "TOKEN_INVALID",
      "Token invalido. Faca login novamente.",
      401
    );
  }

  const supabase = getAdminClient();
  const { data: session, error } = await supabase
    .from("Sessao")
    .select("id, revogadoEm")
    .eq("id", payload.sessionId)
    .maybeSingle();

  if (error || !session || session.revogadoEm) {
    throw new AppError(
      "SESSION_EXPIRED",
      "Sua sessao expirou. Faca login novamente.",
      401
    );
  }

  await supabase
    .from("Sessao")
    .update({ ultimoAcesso: new Date().toISOString() })
    .eq("id", payload.sessionId);

  return payload;
}
