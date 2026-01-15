import { getAdminClient } from "./supabaseClient.ts";
import { sendExpoPushNotification } from "./expoPush.ts";

function formatMoneyFromCents(valor: number) {
  return (valor / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatMoney(valor: number) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

async function getUserForNotification(userId: string) {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from("Usuario")
    .select("expoPushToken, notificacoesPushTransacoes, notificacoesPushObjetivos")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

export async function notificarTransacaoCriada(params: {
  userId: string;
  tipo: "receita" | "despesa";
  valor: number;
  descricao?: string | null;
}) {
  const user = await getUserForNotification(params.userId);
  if (!user || !user.expoPushToken || !user.notificacoesPushTransacoes) {
    return;
  }

  const titulo = "Nova transacao registrada";
  const sinal = params.tipo === "despesa" ? "-" : "+";
  const descricao =
    params.descricao?.trim() || (params.tipo === "despesa" ? "Despesa" : "Receita");
  const mensagem = `${descricao}: ${sinal} R$ ${formatMoneyFromCents(
    params.valor
  )}`;

  await sendExpoPushNotification({
    token: user.expoPushToken,
    title: titulo,
    body: mensagem,
    data: { tipo: "transacao" },
  });
}

export async function notificarObjetivoCriado(params: {
  userId: string;
  nome: string;
  meta: number;
  dataLimite: Date;
}) {
  const user = await getUserForNotification(params.userId);
  if (!user || !user.expoPushToken || !user.notificacoesPushObjetivos) {
    return;
  }

  const titulo = "Novo objetivo criado";
  const prazo = params.dataLimite.toLocaleDateString("pt-BR");
  const mensagem = `${params.nome} - Meta R$ ${formatMoney(
    params.meta
  )} ate ${prazo}.`;

  await sendExpoPushNotification({
    token: user.expoPushToken,
    title: titulo,
    body: mensagem,
    data: { tipo: "objetivo" },
  });
}
