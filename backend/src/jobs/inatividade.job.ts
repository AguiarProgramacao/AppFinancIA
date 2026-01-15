import { addDays, startOfDay } from "date-fns";
import { prisma } from "../prisma/client";
import { sendExpoPushNotification } from "../utils/expoPush";

const CHECK_INTERVAL_MS = 60 * 1000;
const PERIODS = [10, 22];
let running = false;

export function startInatividadeScheduler() {
  const run = async () => {
    if (running) {
      return;
    }

    const now = new Date();
    if (!PERIODS.includes(now.getHours()) || now.getMinutes() !== 0) {
      return;
    }

    running = true;
    try {
      const referenciaDia = startOfDay(now);
      const fimDia = addDays(referenciaDia, 1);
      const periodo = `${now.getHours()}h`;

      const usuarios = await prisma.usuario.findMany({
        select: {
          id: true,
          expoPushToken: true,
          notificacoesPushTransacoes: true,
        },
      });

      for (const usuario of usuarios) {
        const temTransacao = await prisma.transacao.findFirst({
          where: {
            usuarioId: usuario.id,
            data: { gte: referenciaDia, lt: fimDia },
          },
          select: { id: true },
        });

        if (temTransacao) {
          continue;
        }

        const jaEnviado = await prisma.notificacao.findFirst({
          where: {
            usuarioId: usuario.id,
            tipo: "sem-transacao",
            referenciaDia,
            periodo,
          },
          select: { id: true },
        });

        if (jaEnviado) {
          continue;
        }

        const titulo = "Sem transacoes hoje";
        const mensagem =
          "Voce ainda nao registrou transacoes hoje. Adicione entradas e saidas para manter o controle.";

        await prisma.notificacao.create({
          data: {
            tipo: "sem-transacao",
            titulo,
            mensagem,
            referenciaDia,
            periodo,
            usuarioId: usuario.id,
          },
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
    } catch (err) {
      console.error("Erro ao enviar notificacoes:", err);
    } finally {
      running = false;
    }
  };

  run();
  setInterval(run, CHECK_INTERVAL_MS);
}
