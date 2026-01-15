import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";

export interface Aporte {
  id: string;
  titulo: string;
  valor: number;
  observacao?: string;
  data: string;
}

export interface Objetivo {
  id: string;
  nome: string;
  meta: number;
  economizado: number;
  dataLimite: string;
  aportes?: Aporte[];
}

async function getToken() {
  const token = await AsyncStorage.getItem("@token");
  if (!token) throw new Error("Token não encontrado");
  return token;
}

export async function listarObjetivos(): Promise<Objetivo[]> {
  const token = await getToken();
  return apiRequest("/objetivos", "GET", undefined, token);
}

export async function buscarObjetivoPorId(
  id: string
): Promise<Objetivo> {
  const token = await getToken();
  return apiRequest(`/objetivos/${id}`, "GET", undefined, token);
}

export async function criarObjetivo(data: {
  nome: string;
  meta: number;
  valorInicial?: number;
  dataLimite: string;
}) {
  const token = await getToken();
  return apiRequest("/objetivos", "POST", data, token);
}

export async function atualizarObjetivo(
  id: string,
  data: {
    nome?: string;
    meta?: number;
    economizado?: number;
    dataLimite?: string;
  }
) {
  const token = await getToken();
  return apiRequest(`/objetivos/${id}`, "PUT", data, token);
}

export async function criarAporte(
  objetivoId: string,
  valor: number
) {
  const token = await getToken();
  return apiRequest(
    `/objetivos/${objetivoId}/aportar`,
    "POST",
    { valor },
    token
  );
}

export async function deletarObjetivo(id: string) {
  const token = await getToken();
  return apiRequest(`/objetivos/${id}`, "DELETE", undefined, token);
}
