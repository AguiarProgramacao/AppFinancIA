"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const graficos_controller_1 = require("../controllers/graficos.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/categorias", auth_middleware_1.authMiddleware, graficos_controller_1.categorias);
exports.default = router;
