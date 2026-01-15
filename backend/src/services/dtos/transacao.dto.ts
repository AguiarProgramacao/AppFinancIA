export interface CreateTransacaoDTO {
  tipo: "despesa" | "receita";
  valor: number;
  descricao?: string;
  data: string;
  categoriaId: string;
  formaPagamento?: string;
  observacoes?: string;
}

export interface UpdateTransacaoDTO {
  tipo?: "despesa" | "receita";
  valor?: number;
  descricao?: string;
  data?: string;
  categoriaId?: string;
  formaPagamento?: string;
  observacoes?: string;
}
