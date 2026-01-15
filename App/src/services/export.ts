import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest, API_URL } from "./api";

async function getToken() {
  const token = await AsyncStorage.getItem("@token");
  if (!token) throw new Error("Token nao encontrado");
  return token;
}

export async function getExportSummary(params?: {
  start?: string;
  end?: string;
  period?: string;
}) {
  const token = await getToken();
  const search = new URLSearchParams();
  if (params?.start) search.set("start", params.start);
  if (params?.end) search.set("end", params.end);
  if (params?.period) search.set("period", params.period);
  const suffix = search.toString();
  const path = suffix ? `/export/summary?${suffix}` : "/export/summary";
  return apiRequest(path, "GET", undefined, token);
}

export async function downloadExport(
  format: "csv" | "json" | "pdf",
  params?: {
    start?: string;
    end?: string;
    period?: string;
  }
) {
  const token = await getToken();
  const search = new URLSearchParams({ format });
  if (format === "pdf") {
    search.set("encoding", "base64");
  }
  if (params?.start) search.set("start", params.start);
  if (params?.end) search.set("end", params.end);
  if (params?.period) search.set("period", params.period);
  const res = await fetch(`${API_URL}/export?${search.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Erro ao exportar");
  }

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  return { text, contentType, isBase64: format === "pdf" };
}
