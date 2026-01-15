"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remover = exports.atualizar = exports.buscarPorId = exports.listar = exports.criar = void 0;
const categoria_service_1 = require("../services/categoria.service");
const criar = async (req, res) => {
    const categoria = await (0, categoria_service_1.criarCategoria)(req.body);
    return res.status(201).json(categoria);
};
exports.criar = criar;
const listar = async (req, res) => {
    const { tipo } = req.query;
    const categorias = await (0, categoria_service_1.listarCategorias)(tipo);
    return res.json(categorias);
};
exports.listar = listar;
const buscarPorId = async (req, res) => {
    const categoria = await (0, categoria_service_1.buscarCategoriaPorId)(req.params.id);
    if (!categoria) {
        return res.status(404).json({ error: "Categoria não encontrada" });
    }
    return res.json(categoria);
};
exports.buscarPorId = buscarPorId;
const atualizar = async (req, res) => {
    const categoria = await (0, categoria_service_1.atualizarCategoria)(req.params.id, req.body);
    return res.json(categoria);
};
exports.atualizar = atualizar;
const remover = async (req, res) => {
    await (0, categoria_service_1.deletarCategoria)(req.params.id);
    return res.status(204).send();
};
exports.remover = remover;
