"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transacao_routes_1 = __importDefault(require("./routes/transacao.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const transacao_routes_2 = __importDefault(require("./routes/transacao.routes"));
const categoria_routes_1 = __importDefault(require("./routes/categoria.routes"));
const graficos_routes_1 = __importDefault(require("./routes/graficos.routes"));
const objetivo_routes_1 = __importDefault(require("./routes/objetivo.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/usuarios", transacao_routes_1.default);
app.use("/auth", auth_routes_1.default);
app.use("/transacoes", transacao_routes_2.default);
app.use("/categorias", categoria_routes_1.default);
app.use("/graficos", graficos_routes_1.default);
app.use("/objetivos", objetivo_routes_1.default);
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
