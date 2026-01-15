"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const auth_service_1 = require("../services/auth.service");
async function register(req, res) {
    try {
        const user = await (0, auth_service_1.registerService)(req.body);
        return res.status(201).json(user);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
}
async function login(req, res) {
    try {
        const result = await (0, auth_service_1.loginService)(req.body);
        return res.json(result);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
}
