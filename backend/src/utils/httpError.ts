import { Response } from "express";
import { normalizeError } from "./appError";

export function handleControllerError(res: Response, err: any) {
  const normalized = normalizeError(err);
  return res.status(normalized.status).json({
    error: normalized.message,
    code: normalized.code,
  });
}
