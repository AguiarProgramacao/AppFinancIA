import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";

async function getToken() {
  const token = await AsyncStorage.getItem("@token");
  if (!token) throw new Error("Token nao encontrado");
  return token;
}

export async function getSecurityStatus() {
  const token = await getToken();
  return apiRequest("/security/status", "GET", undefined, token);
}

export async function changePassword(senhaAtual: string, novaSenha: string) {
  const token = await getToken();
  return apiRequest(
    "/security/password",
    "POST",
    { senhaAtual, novaSenha },
    token
  );
}

export async function requestTwoFactor() {
  const token = await getToken();
  return apiRequest("/security/2fa/request", "POST", {}, token);
}

export async function confirmTwoFactor(tokenId: string, code: string) {
  const token = await getToken();
  return apiRequest(
    "/security/2fa/confirm",
    "POST",
    { tokenId, code },
    token
  );
}

export async function disableTwoFactor(senhaAtual: string) {
  const token = await getToken();
  return apiRequest(
    "/security/2fa/disable",
    "POST",
    { senhaAtual },
    token
  );
}

export async function listSessions() {
  const token = await getToken();
  return apiRequest("/security/sessions", "GET", undefined, token);
}

export async function revokeSession(sessionId: string) {
  const token = await getToken();
  return apiRequest(
    `/security/sessions/revoke/${sessionId}`,
    "POST",
    {},
    token
  );
}

export async function revokeOtherSessions() {
  const token = await getToken();
  return apiRequest(
    "/security/sessions/revoke-others",
    "POST",
    {},
    token
  );
}
