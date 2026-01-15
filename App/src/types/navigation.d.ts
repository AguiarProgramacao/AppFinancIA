export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Profile: undefined;
  Security: undefined;
  Notifications: undefined;
  ExportData: undefined;
  About: undefined;
  Transacoes: undefined;
  NovaTransacao: { id?: string; tipo?: "despesa" | "receita" } | undefined;
  TransacaoDetalhe: { id: string };
  Objetivos: undefined;
  ObjetivoForm: { id?: string } | undefined;
  ObjetivoDetalhe: { id: string };
};

