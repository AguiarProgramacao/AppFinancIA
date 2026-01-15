"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarCategoria = criarCategoria;
exports.listarCategorias = listarCategorias;
exports.buscarCategoriaPorId = buscarCategoriaPorId;
exports.atualizarCategoria = atualizarCategoria;
exports.deletarCategoria = deletarCategoria;
const client_1 = require("../prisma/client");
function criarCategoria(data) {
    return client_1.prisma.categoria.create({ data });
}
function listarCategorias(tipo) {
    return client_1.prisma.categoria.findMany({
        where: tipo ? { tipo } : undefined,
        orderBy: { nome: "asc" },
    });
}
function buscarCategoriaPorId(id) {
    return client_1.prisma.categoria.findUnique({ where: { id } });
}
function atualizarCategoria(id, data) {
    return client_1.prisma.categoria.update({
        where: { id },
        data,
    });
}
function deletarCategoria(id) {
    return client_1.prisma.categoria.delete({ where: { id } });
}
