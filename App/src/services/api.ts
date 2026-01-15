import { emitUnauthorized } from "../utils/authEvents";
import { ApiError } from "../utils/errors";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:3333";

export async function apiRequest<T = any>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
  token?: string
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401) {
      emitUnauthorized();
    }
    throw new ApiError(
      data?.error || "Erro inesperado",
      data?.code,
      res.status
    );
  }

  return data as T;
}
