import { getAdminClient } from "../_shared/supabaseClient.ts";
import { sendExpoPushNotification } from "../_shared/expoPush.ts";
import { corsResponse, handleError, jsonResponse } from "../_shared/responses.ts";

const PERIODS = [10, 22];

function getTimezoneOffsetMs() {
  const raw = Deno.env.get("TIMEZONE_OFFSET");
  const hours = raw ? Number(raw) : -3;
  return hours * 60 * 60 * 1000;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const supabase = getAdminClient();
    const offsetMs = getTimezoneOffsetMs();
    const nowUtc = new Date();
    const localNow = new Date(nowUtc.getTime() + offsetMs);

    if (!PERIODS.includes(localNow.getHours())) {
      return jsonResponse({ ok: true, skipped: true });
    }

    const startLocal = new Date(
      localNow.getFullYear(),
      localNow.getMonth(),
      localNow.getDate(),
      0,
      0,
      0,
      0
    );
    const startUtc = new Date(startLocal.getTime() - offsetMs);
    const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);
    const periodo = `${localNow.getHours()}h`;

    const { data: usuarios } = await supabase
      .from("Usuario")
      .select("id, expoPushToken, notificacoesPushTransacoes");

    for (const usuario of usuarios || []) {
      const { data: temTransacao } = await supabase
        .from("Transacao")
        .select("id")
        .eq("usuarioId", usuario.id)
        .gte("data", startUtc.toISOString())
        .lt("data", endUtc.toISOString())
        .limit(1);

      if (temTransacao && temTransacao.length > 0) {
        continue;
      }

      const { data: jaEnviado } = await supabase
        .from("Notificacao")
        .select("id")
        .eq("usuarioId", usuario.id)
        .eq("tipo", "sem-transacao")
        .eq("referenciaDia", startUtc.toISOString())
        .eq("periodo", periodo)
        .limit(1);

      if (jaEnviado && jaEnviado.length > 0) {
        continue;
      }

      const titulo = "Sem transacoes hoje";
      const mensagem =
        "Voce ainda nao registrou transacoes hoje. Adicione entradas e saidas para manter o controle.";

      await supabase.from("Notificacao").insert({
        tipo: "sem-transacao",
        titulo,
        mensagem,
        referenciaDia: startUtc.toISOString(),
        periodo,
        usuarioId: usuario.id,
      });

      if (usuario.notificacoesPushTransacoes && usuario.expoPushToken) {
        await sendExpoPushNotification({
          token: usuario.expoPushToken,
          title: titulo,
          body: mensagem,
          data: { tipo: "sem-transacao" },
        });
      }
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return handleError(err);
  }
});
