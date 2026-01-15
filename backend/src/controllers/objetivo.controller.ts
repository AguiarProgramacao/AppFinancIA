import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../types/auth";
import * as service from "../services/objetivo.service";
import { notificarObjetivoCriado } from "../services/notification-events.service";
import { handleControllerError } from "../utils/httpError";

export const criar: RequestHandler = async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const objetivo = await service.criarObjetivo(userId!, req.body);

    try {
      await notificarObjetivoCriado({
        userId: userId!,
        nome: objetivo.nome,
        meta: objetivo.meta,
        dataLimite: new Date(objetivo.dataLimite),
      });
    } catch (err) {
      console.warn("Falha ao enviar notificacao de objetivo.");
    }

    return res.status(201).json(objetivo);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};

export const listar: RequestHandler = async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const objetivos = await service.listarObjetivos(userId!);
    return res.json(objetivos);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};

export const buscarPorId: RequestHandler = async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const objetivo = await service.buscarObjetivoPorId(userId!, req.params.id);
    if (!objetivo) {
      return res
        .status(404)
        .json({ error: "Objetivo nao encontrado.", code: "GOAL_NOT_FOUND" });
    }
    return res.json(objetivo);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};

export const atualizar: RequestHandler = async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const objetivo = await service.atualizarObjetivo(
      userId!,
      req.params.id,
      req.body
    );
    return res.json(objetivo);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};

export const remover: RequestHandler = async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    await service.deletarObjetivo(userId!, req.params.id);
    return res.status(204).send();
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};

export const aportar: RequestHandler = async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { valor } = req.body;
    if (valor === undefined || Number.isNaN(Number(valor))) {
      return res.status(400).json({
        error: "Informe um valor valido para o aporte.",
        code: "INVALID_GOAL_DEPOSIT",
      });
    }
    const objetivo = await service.aportarObjetivo(
      userId!,
      req.params.id,
      valor
    );
    return res.json(objetivo);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};
