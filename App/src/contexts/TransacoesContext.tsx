import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "../services/api";

interface Transacao {
  id: string;
  tipo: string;
  valor: number;
  data: string;
  categoria: {
    nome: string;
    cor: string;
  };
}

interface TransacoesContextData {
  transacoes: Transacao[];
  carregar(): Promise<void>;
  criar(data: any): Promise<void>;
  atualizar(id: string, data: any): Promise<void>;
  remover(id: string): Promise<void>;
}

const TransacoesContext = createContext({} as TransacoesContextData);

export function TransacoesProvider({ children }: { children: React.ReactNode }) {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  async function carregar() {
    const token = await AsyncStorage.getItem("@token");
    const data = await apiRequest("/transacoes", "GET", undefined, token!);
    setTransacoes(data);
  }

  async function criar(payload: any) {
    const token = await AsyncStorage.getItem("@token");
    await apiRequest("/transacoes", "POST", payload, token!);
    await carregar();
  }

  async function atualizar(id: string, payload: any) {
    const token = await AsyncStorage.getItem("@token");
    await apiRequest(`/transacoes/${id}`, "PUT", payload, token!);
    await carregar();
  }

  async function remover(id: string) {
    const token = await AsyncStorage.getItem("@token");
    await apiRequest(`/transacoes/${id}`, "DELETE", undefined, token!);
    setTransacoes((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <TransacoesContext.Provider
      value={{ transacoes, carregar, criar, atualizar, remover }}
    >
      {children}
    </TransacoesContext.Provider>
  );
}

export function useTransacoes() {
  return useContext(TransacoesContext);
}
