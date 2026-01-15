import { apiRequest } from "./api";

export async function requestPasswordReset(email: string) {
  return apiRequest("/auth/forgot-password", "POST", { email });
}

export async function resetPassword(
  tokenId: string,
  code: string,
  novaSenha: string
) {
  return apiRequest("/auth/reset-password", "POST", {
    tokenId,
    code,
    novaSenha,
  });
}
