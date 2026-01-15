import { prisma } from "../prisma/client";
import { gerarInsightsParaUsuario } from "../services/insights.service";

const RUN_INTERVAL_MS = 60 * 60 * 1000;
let running = false;

export function startInsightScheduler() {
  const run = async () => {
    if (running) {
      return;
    }
    running = true;
    try {
      const usuarios = await prisma.usuario.findMany({
        select: { id: true },
      });

      for (const usuario of usuarios) {
        await gerarInsightsParaUsuario(usuario.id);
      }
    } catch (err) {
      console.error("Erro ao gerar insights:", err);
    } finally {
      running = false;
    }
  };

  run();
  setInterval(run, RUN_INTERVAL_MS);
}
