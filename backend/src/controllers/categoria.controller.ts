import { RequestHandler } from "express";
import {
  criarCategoria,
  listarCategorias,
  buscarCategoriaPorId,
  atualizarCategoria,
  deletarCategoria,
} from "../services/categoria.service";
import { AuthenticatedRequest } from "../types/auth";
import { handleControllerError } from "../utils/httpError";

export const criar: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const categoria = await criarCategoria(authReq.userId, req.body);
    return res.status(201).json(categoria);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};

export const listar: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { tipo } = req.query;
    const categorias = await listarCategorias(authReq.userId, tipo as string);
    return res.json(categorias);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};

export const buscarPorId: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const categoria = await buscarCategoriaPorId(authReq.userId, req.params.id);
    if (!categoria) {
      return res
        .status(404)
        .json({ error: "Categoria nao encontrada", code: "CATEGORY_NOT_FOUND" });
    }
    return res.json(categoria);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};

export const atualizar: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const categoria = await atualizarCategoria(
      authReq.userId,
      req.params.id,
      req.body
    );
    return res.json(categoria);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};

export const remover: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    await deletarCategoria(authReq.userId, req.params.id);
    return res.status(204).send();
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};
