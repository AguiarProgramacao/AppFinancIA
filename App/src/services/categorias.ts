import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";

export interface Categoria {
  id: string;
  nome: string;
  tipo: "despesa" | "receita";
  cor: string;
}

async function getToken() {
  const token = await AsyncStorage.getItem("@token");
  if (!token) throw new Error("Token não encontrado");
  return token;
}

export async function listarCategorias(tipo?: string): Promise<Categoria[]> {
  const token = await getToken();
  const query = tipo ? `?tipo=${tipo}` : "";
  return apiRequest(`/categorias${query}`, "GET", undefined, token);
}

export async function criarCategoria(data: Omit<Categoria, "id">) {
  const token = await getToken();
  return apiRequest("/categorias", "POST", data, token);
}
