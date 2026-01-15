import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../types/auth";
import {
  criarTransacao,
  listarTransacoes,
  buscarTransacaoPorId,
  atualizarTransacao,
  deletarTransacao,
} from "../services/transacao.service";
import { notificarTransacaoCriada } from "../services/notification-events.service";
import { handleControllerError } from "../utils/httpError";

export const criar: RequestHandler = async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;

    const transacao = await criarTransacao(userId!, {
      ...req.body,
      data: new Date(req.body.data),
    });

    try {
      const tipo = transacao.tipo === "despesa" ? "despesa" : "receita";
      await notificarTransacaoCriada({
        userId: userId!,
        tipo,
        valor: transacao.valor,
        descricao: transacao.descricao,
      });
    } catch (err) {
      console.warn("Falha ao enviar notificacao de transacao.");
    }

    return res.status(201).json(transacao);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};

export const listar: RequestHandler = async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;

    const mesRaw = req.query.mes;
    const anoRaw = req.query.ano;
    const mesNum = typeof mesRaw === "string" ? Number(mesRaw) : NaN;
    const anoNum = typeof anoRaw === "string" ? Number(anoRaw) : NaN;
    let mes: number | undefined;
    let ano: number | undefined;

    if (Number.isFinite(mesNum)) {
      if (mesNum >= 0 && mesNum <= 11) {
        mes = mesNum;
      } else if (mesNum >= 1 && mesNum <= 12) {
        mes = mesNum - 1;
      }
    }

    if (Number.isFinite(anoNum) && anoNum >= 1970) {
      ano = anoNum;
    }

    const transacoes = await listarTransacoes(userId!, mes, ano);
    return res.json(transacoes);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};

export const buscarPorId: RequestHandler = async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const transacao = await buscarTransacaoPorId(userId!, req.params.id);

    if (!transacao) {
      return res.status(404).json({
        error: "Transacao nao encontrada.",
        code: "TRANSACTION_NOT_FOUND",
      });
    }

    return res.json(transacao);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};

export const atualizar: RequestHandler = async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const transacao = await atualizarTransacao(
      userId!,
      req.params.id,
      req.body
    );
    return res.json(transacao);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};

export const remover: RequestHandler = async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    await deletarTransacao(userId!, req.params.id);
    return res.status(204).send();
  } catch (err: any) {
    return handleControllerError(res, err);
  }
};
