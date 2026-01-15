"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorias = void 0;
const graficos_service_1 = require("../services/graficos.service");
const categorias = async (req, res) => {
    const { userId } = req;
    const { periodo = "todos" } = req.query;
    const data = await (0, graficos_service_1.resumoPorCategoria)(userId, periodo);
    return res.json(data);
};
exports.categorias = categorias;
