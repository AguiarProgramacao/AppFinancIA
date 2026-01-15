import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";

export interface CategoriaGrafico {
  id: string;
  label: string;
  color: string;
  valor: number;
  percentual: number;
}

async function getToken() {
  const token = await AsyncStorage.getItem("@token");
  if (!token) throw new Error("Token não encontrado");
  return token;
}

export async function listarCategoriasGrafico(periodo: string) {
  const token = await getToken();
  return apiRequest<CategoriaGrafico[]>(
    `/graficos/categorias?periodo=${periodo}`, "GET", undefined, token
  );
}
