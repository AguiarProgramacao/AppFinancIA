"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.aportar = exports.remover = exports.atualizar = exports.buscarPorId = exports.listar = exports.criar = void 0;
const service = __importStar(require("../services/objetivo.service"));
const criar = async (req, res) => {
    const { userId } = req;
    const objetivo = await service.criarObjetivo(userId, req.body);
    return res.status(201).json(objetivo);
};
exports.criar = criar;
const listar = async (req, res) => {
    const { userId } = req;
    const objetivos = await service.listarObjetivos(userId);
    return res.json(objetivos);
};
exports.listar = listar;
const buscarPorId = async (req, res) => {
    const { userId } = req;
    const objetivo = await service.buscarObjetivoPorId(userId, req.params.id);
    if (!objetivo) {
        return res.status(404).json({ error: "Objetivo não encontrado" });
    }
    return res.json(objetivo);
};
exports.buscarPorId = buscarPorId;
const atualizar = async (req, res) => {
    const { userId } = req;
    const objetivo = await service.atualizarObjetivo(userId, req.params.id, req.body);
    return res.json(objetivo);
};
exports.atualizar = atualizar;
const remover = async (req, res) => {
    const { userId } = req;
    await service.deletarObjetivo(userId, req.params.id);
    return res.status(204).send();
};
exports.remover = remover;
const aportar = async (req, res) => {
    const { userId } = req;
    const { valor } = req.body;
    const objetivo = await service.aportarObjetivo(userId, req.params.id, valor);
    return res.json(objetivo);
};
exports.aportar = aportar;
