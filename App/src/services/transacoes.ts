import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";

export interface TransacaoPayload {
  tipo: "despesa" | "receita";
  valor: number;
  descricao?: string;
  data: string; // yyyy-mm-dd
  formaPagamento?: string;
  observacoes?: string;
  categoriaId: string;
}

async function getToken() {
  const token = await AsyncStorage.getItem("@token");
  if (!token) throw new Error("Token não encontrado");
  return token;
}

export async function listarTransacoes(mes?: number, ano?: number) {
  const token = await getToken();
  const params =
    mes !== undefined && ano !== undefined ? `?mes=${mes}&ano=${ano}` : "";
  return apiRequest(`/transacoes${params}`, "GET", undefined, token);
}

export async function criarTransacao(data: TransacaoPayload) {
  const token = await getToken();
  return apiRequest("/transacoes", "POST", data, token);
}

export async function atualizarTransacao(id: string, data: Partial<TransacaoPayload>) {
  const token = await getToken();
  return apiRequest(`/transacoes/${id}`, "PUT", data, token);
}

export async function deletarTransacao(id: string) {
  const token = await getToken();
  return apiRequest(`/transacoes/${id}`, "DELETE", undefined, token);
}

export async function buscarTransacaoPorId(id: string) {
  const token = await getToken();
  return apiRequest(`/transacoes/${id}`, "GET", undefined, token);
}
