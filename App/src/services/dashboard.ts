import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";

export interface DashboardResumo {
  saldo: number;
  receitas: number;
  despesas: number;
  ultimasTransacoes: any[];
  objetivos: any[];
  insights: DashboardInsight[];
}

export interface DashboardInsight {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  criadoEm: string;
  expiraEm: string;
}

async function getToken() {
  const token = await AsyncStorage.getItem("@token");
  if (!token) throw new Error("Token não encontrado");
  return token;
}

export async function buscarResumoDashboard(
  mes?: number,
  ano?: number
): Promise<DashboardResumo> {
  const token = await getToken();

  const params =
    mes !== undefined && ano !== undefined
      ? `?mes=${mes}&ano=${ano}`
      : "";

  return apiRequest(
    `/dashboard/resumo${params}`,
    "GET",
    undefined,
    token
  );
}
