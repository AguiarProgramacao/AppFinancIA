"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarTransacao = criarTransacao;
exports.listarTransacoes = listarTransacoes;
exports.buscarTransacaoPorId = buscarTransacaoPorId;
exports.atualizarTransacao = atualizarTransacao;
exports.deletarTransacao = deletarTransacao;
const client_1 = require("../prisma/client");
function criarTransacao(userId, data) {
    return client_1.prisma.transacao.create({
        data: {
            ...data,
            usuarioId: userId,
        },
    });
}
function listarTransacoes(userId) {
    return client_1.prisma.transacao.findMany({
        where: { usuarioId: userId },
        include: { categoria: true },
        orderBy: { data: "desc" },
    });
}
async function buscarTransacaoPorId(userId, id) {
    return client_1.prisma.transacao.findFirst({
        where: {
            id,
            usuarioId: userId,
        },
        include: {
            categoria: true,
        },
    });
}
async function atualizarTransacao(userId, id, data) {
    const existe = await client_1.prisma.transacao.findFirst({
        where: { id, usuarioId: userId },
    });
    if (!existe) {
        throw new Error("Transação não encontrada");
    }
    return client_1.prisma.transacao.update({
        where: { id },
        data,
    });
}
async function deletarTransacao(userId, id) {
    const existe = await client_1.prisma.transacao.findFirst({
        where: { id, usuarioId: userId },
    });
    if (!existe) {
        throw new Error("Transação não encontrada");
    }
    await client_1.prisma.transacao.delete({
        where: { id },
    });
}
