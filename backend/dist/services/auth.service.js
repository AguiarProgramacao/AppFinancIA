"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerService = registerService;
exports.loginService = loginService;
const client_1 = require("../prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function registerService(data) {
    const { nome, email, senha } = data;
    const userExists = await client_1.prisma.usuario.findUnique({
        where: { email },
    });
    if (userExists) {
        throw new Error("E-mail já cadastrado");
    }
    const senhaHash = await bcryptjs_1.default.hash(senha, 10);
    const user = await client_1.prisma.usuario.create({
        data: {
            nome,
            email,
            senha: senhaHash,
        },
    });
    return {
        id: user.id,
        nome: user.nome,
        email: user.email,
    };
}
async function loginService(data) {
    const { email, senha } = data;
    const user = await client_1.prisma.usuario.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error("E-mail ou senha inválidos");
    }
    const senhaValida = await bcryptjs_1.default.compare(senha, user.senha);
    if (!senhaValida) {
        throw new Error("E-mail ou senha inválidos");
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return {
        token,
        user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
        },
    };
}
