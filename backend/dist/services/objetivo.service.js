"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarObjetivo = criarObjetivo;
exports.listarObjetivos = listarObjetivos;
exports.buscarObjetivoPorId = buscarObjetivoPorId;
exports.atualizarObjetivo = atualizarObjetivo;
exports.deletarObjetivo = deletarObjetivo;
exports.aportarObjetivo = aportarObjetivo;
const client_1 = require("../prisma/client");
function criarObjetivo(userId, data) {
    return client_1.prisma.objetivo.create({
        data: {
            ...data,
            usuarioId: userId,
            dataLimite: new Date(data.dataLimite),
        },
    });
}
function listarObjetivos(userId) {
    return client_1.prisma.objetivo.findMany({
        where: { usuarioId: userId },
        orderBy: { dataLimite: "asc" },
    });
}
function buscarObjetivoPorId(userId, id) {
    return client_1.prisma.objetivo.findFirst({
        where: {
            id,
            usuarioId: userId,
        },
        include: {
            aportes: {
                orderBy: {
                    data: "desc",
                },
            },
        },
    });
}
function atualizarObjetivo(userId, id, data) {
    return client_1.prisma.objetivo.updateMany({
        where: { id, usuarioId: userId },
        data,
    });
}
function deletarObjetivo(userId, id) {
    return client_1.prisma.objetivo.deleteMany({
        where: { id, usuarioId: userId },
    });
}
function aportarObjetivo(userId, id, valor) {
    return client_1.prisma.objetivo.update({
        where: { id },
        data: {
            economizado: {
                increment: valor,
            },
        },
    });
}
