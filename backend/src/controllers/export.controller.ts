import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import {
  getExportCsv,
  getExportData,
  getExportPdf,
  getExportSummary,
  resolveExportRange,
} from "../services/export.service";
import { handleControllerError } from "../utils/httpError";

export async function summary(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const range = resolveExportRange({
      period: String(req.query.period || ""),
      start: typeof req.query.start === "string" ? req.query.start : undefined,
      end: typeof req.query.end === "string" ? req.query.end : undefined,
    });
    const data = await getExportSummary(authReq.userId, range);
    return res.json(data);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}

export async function exportData(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const format = String(req.query.format || "json").toLowerCase();
    const encoding = String(req.query.encoding || "").toLowerCase();
    const range = resolveExportRange({
      period: String(req.query.period || ""),
      start: typeof req.query.start === "string" ? req.query.start : undefined,
      end: typeof req.query.end === "string" ? req.query.end : undefined,
    });

    if (format === "csv") {
      const csv = await getExportCsv(authReq.userId, range);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=financia-export.csv");
      return res.send(csv);
    }

    if (format === "pdf") {
      const pdf = await getExportPdf(authReq.userId, range);
      if (encoding === "base64") {
        res.setHeader("Content-Type", "text/plain");
        return res.send(pdf.toString("base64"));
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=financia-extrato.pdf"
      );
      return res.send(pdf);
    }

    const data = await getExportData(authReq.userId, range);
    return res.json(data);
  } catch (err: any) {
    return handleControllerError(res, err);
  }
}
