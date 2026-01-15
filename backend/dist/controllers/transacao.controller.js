"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remover = exports.atualizar = exports.buscarPorId = exports.listar = exports.criar = void 0;
const transacao_service_1 = require("../services/transacao.service");
/* =========================
   CREATE
========================= */
const criar = async (req, res) => {
    const { userId } = req;
    console.log("🔵 [CRIAR]");
    console.log("USER ID:", userId);
    console.log("BODY:", req.body);
    const transacao = await (0, transacao_service_1.criarTransacao)(userId, {
        ...req.body,
        data: new Date(req.body.data),
    });
    console.log("CRIADO:", transacao.id);
    return res.status(201).json(transacao);
};
exports.criar = criar;
/* =========================
   LIST
========================= */
const listar = async (req, res) => {
    const { userId } = req;
    console.log("🟢 [LISTAR]");
    console.log("USER ID:", userId);
    const transacoes = await (0, transacao_service_1.listarTransacoes)(userId);
    console.log("TOTAL:", transacoes.length);
    return res.json(transacoes);
};
exports.listar = listar;
/* =========================
   GET BY ID
========================= */
const buscarPorId = async (req, res) => {
    const { userId } = req;
    console.log("🟡 [BUSCAR POR ID]");
    console.log("PARAM ID:", req.params.id);
    console.log("USER ID:", userId);
    try {
        const transacao = await (0, transacao_service_1.buscarTransacaoPorId)(userId, req.params.id);
        console.log("RESULTADO:", transacao);
        if (!transacao) {
            console.log("⚠️ NÃO ENCONTRADA");
            return res.status(404).json({ error: "Transação não encontrada" });
        }
        return res.json(transacao);
    }
    catch (err) {
        console.error("❌ ERRO BUSCAR:", err.message);
        return res.status(500).json({ error: err.message });
    }
};
exports.buscarPorId = buscarPorId;
/* =========================
   UPDATE
========================= */
const atualizar = async (req, res) => {
    const { userId } = req;
    console.log("🟠 [ATUALIZAR]");
    console.log("PARAM ID:", req.params.id);
    console.log("USER ID:", userId);
    console.log("BODY:", req.body);
    try {
        const transacao = await (0, transacao_service_1.atualizarTransacao)(userId, req.params.id, req.body);
        console.log("ATUALIZADO:", transacao);
        return res.json(transacao);
    }
    catch (err) {
        console.error("❌ ERRO ATUALIZAR:", err.message);
        return res.status(400).json({ error: err.message });
    }
};
exports.atualizar = atualizar;
/* =========================
   DELETE
========================= */
const remover = async (req, res) => {
    const { userId } = req;
    console.log("🔴 [REMOVER]");
    console.log("PARAM ID:", req.params.id);
    console.log("USER ID:", userId);
    try {
        await (0, transacao_service_1.deletarTransacao)(userId, req.params.id);
        console.log("REMOVIDA COM SUCESSO");
        return res.status(204).send();
    }
    catch (err) {
        console.error("❌ ERRO REMOVER:", err.message);
        return res.status(404).json({ error: err.message });
    }
};
exports.remover = remover;
