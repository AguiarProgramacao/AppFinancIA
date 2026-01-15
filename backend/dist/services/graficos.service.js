"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumoPorCategoria = resumoPorCategoria;
const client_1 = require("../prisma/client");
const date_fns_1 = require("date-fns");
async function resumoPorCategoria(userId, periodo) {
    let dataInicio;
    let dataFim;
    const agora = new Date();
    if (periodo === "mes") {
        dataInicio = (0, date_fns_1.startOfMonth)(agora);
        dataFim = (0, date_fns_1.endOfMonth)(agora);
    }
    if (periodo === "3meses") {
        dataInicio = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(agora, 2));
        dataFim = (0, date_fns_1.endOfDay)(agora);
    }
    const transacoes = await client_1.prisma.transacao.findMany({
        where: {
            usuarioId: userId,
            tipo: "despesa",
            ...(dataInicio && dataFim && {
                data: {
                    gte: dataInicio,
                    lte: dataFim,
                },
            }),
        },
        include: { categoria: true },
    });
    const totalGeral = transacoes.reduce((acc, t) => acc + t.valor, 0);
    const agrupado = Object.values(transacoes.reduce((acc, t) => {
        const id = t.categoria.id;
        if (!acc[id]) {
            acc[id] = {
                id,
                label: t.categoria.nome,
                color: t.categoria.cor,
                valor: 0,
            };
        }
        acc[id].valor += t.valor;
        return acc;
    }, {})).map((c) => ({
        ...c,
        percentual: totalGeral
            ? Math.round((c.valor / totalGeral) * 100)
            : 0,
    }));
    return agrupado;
}
