import { encode as base64Encode } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { requireAuth } from "../_shared/auth.ts";
import { AppError } from "../_shared/errors.ts";
import { getAdminClient } from "../_shared/supabaseClient.ts";
import { corsResponse, handleError, jsonResponse } from "../_shared/responses.ts";
import { buildExtratoPdf } from "../_shared/exportPdf.ts";

function parseDate(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function resolveRange(params: { start?: string; end?: string; period?: string }) {
  const startRaw = parseDate(params.start);
  const endRaw = parseDate(params.end);
  let start = startRaw;
  let end = endRaw;

  if (!start && !end && params.period) {
    const now = new Date();
    if (params.period === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (params.period === "3months") {
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      end = new Date();
    } else if (params.period === "6months") {
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      end = new Date();
    } else if (params.period === "year") {
      start = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      end = new Date();
    }
  }

  if (!start && !end) return undefined;
  return {
    start: start ? new Date(start.setHours(0, 0, 0, 0)) : undefined,
    end: end ? new Date(end.setHours(23, 59, 59, 999)) : undefined,
  };
}

function buildDateFilter(range?: { start?: Date; end?: Date }) {
  if (!range?.start && !range?.end) return null;
  return {
    ...(range?.start ? { gte: range.start.toISOString() } : {}),
    ...(range?.end ? { lte: range.end.toISOString() } : {}),
  };
}

function formatDateRangeLabel(range?: { start?: Date; end?: Date }) {
  if (!range?.start && !range?.end) return "Todo historico";
  const format = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  return `${range?.start ? format(range.start) : "--"} ate ${
    range?.end ? format(range.end) : "--"
  }`;
}

function toCsv(header: string[], rows: any[][]) {
  const csvValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return "";
    const text = String(value).replace(/"/g, '""');
    return `"${text}"`;
  };
  const lines = [header.join(",")];
  rows.forEach((row) => {
    lines.push(row.map(csvValue).join(","));
  });
  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const payload = await requireAuth(req);
    const supabase = getAdminClient();
    const url = new URL(req.url);
    const rawPath = url.pathname.replace(/^\/export/, "");
    const path = rawPath === "" ? "/" : rawPath;
    const range = resolveRange({
      start: url.searchParams.get("start") || undefined,
      end: url.searchParams.get("end") || undefined,
      period: url.searchParams.get("period") || undefined,
    });
    const dateFilter = buildDateFilter(range);

    if (req.method === "GET" && path === "/summary") {
      let transQuery = supabase
        .from("Transacao")
        .select("id", { count: "exact", head: true })
        .eq("usuarioId", payload.userId);
      let objQuery = supabase
        .from("Objetivo")
        .select("id", { count: "exact", head: true })
        .eq("usuarioId", payload.userId);

      if (dateFilter?.gte) {
        transQuery = transQuery.gte("data", dateFilter.gte);
        objQuery = objQuery.gte("dataLimite", dateFilter.gte);
      }
      if (dateFilter?.lte) {
        transQuery = transQuery.lte("data", dateFilter.lte);
        objQuery = objQuery.lte("dataLimite", dateFilter.lte);
      }

      const [{ count: transacoes }, { count: objetivos }] = await Promise.all([
        transQuery,
        objQuery,
      ]);

      return jsonResponse({
        transacoes: transacoes || 0,
        objetivos: objetivos || 0,
      });
    }

    if (req.method === "GET" && path === "/") {
      const format = String(url.searchParams.get("format") || "json").toLowerCase();
      const encoding = String(url.searchParams.get("encoding") || "").toLowerCase();

      const transQuery = supabase
        .from("Transacao")
        .select("*, categoria:categoriaId(*)")
        .eq("usuarioId", payload.userId)
        .order("data", { ascending: false });

      if (dateFilter?.gte) {
        transQuery.gte("data", dateFilter.gte);
      }
      if (dateFilter?.lte) {
        transQuery.lte("data", dateFilter.lte);
      }

      const [{ data: transacoes }, { data: objetivos }, { data: categorias }] =
        await Promise.all([
          transQuery,
          supabase
            .from("Objetivo")
            .select("*, aportes:Aporte(*)")
            .eq("usuarioId", payload.userId)
            .order("dataLimite", { ascending: true }),
          supabase
            .from("Categoria")
            .select("*")
            .eq("usuarioId", payload.userId)
            .order("nome", { ascending: true }),
        ]);

      if (format === "csv") {
        const transacoesHeader = [
          "id",
          "tipo",
          "valor",
          "descricao",
          "data",
          "formaPagamento",
          "observacoes",
          "categoriaId",
          "categoriaNome",
          "categoriaTipo",
          "categoriaCor",
        ];
        const transacoesRows = (transacoes || []).map((item: any) => [
          item.id,
          item.tipo,
          item.valor,
          item.descricao,
          item.data,
          item.formaPagamento,
          item.observacoes,
          item.categoriaId,
          item.categoria?.nome,
          item.categoria?.tipo,
          item.categoria?.cor,
        ]);

        const objetivosHeader = [
          "id",
          "nome",
          "meta",
          "economizado",
          "dataLimite",
          "criadoEm",
        ];
        const objetivosRows = (objetivos || []).map((item: any) => [
          item.id,
          item.nome,
          item.meta,
          item.economizado,
          item.dataLimite,
          item.criadoEm,
        ]);

        const categoriasHeader = ["id", "nome", "tipo", "cor"];
        const categoriasRows = (categorias || []).map((item: any) => [
          item.id,
          item.nome,
          item.tipo,
          item.cor,
        ]);

        const csv = [
          "transacoes",
          toCsv(transacoesHeader, transacoesRows),
          "",
          "objetivos",
          toCsv(objetivosHeader, objetivosRows),
          "",
          "categorias",
          toCsv(categoriasHeader, categoriasRows),
        ].join("\n");

        return new Response(csv, {
          status: 200,
          headers: {
            "Content-Type": "text/csv",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      if (format === "pdf") {
        const { data: usuario } = await supabase
          .from("Usuario")
          .select("nome, email")
          .eq("id", payload.userId)
          .maybeSingle();

        const transacoesOrdenadas = (transacoes || []).slice().sort((a: any, b: any) => {
          return new Date(a.data).getTime() - new Date(b.data).getTime();
        });

        let saldoInicial = 0;
        if (range?.start) {
          const { data: anteriores } = await supabase
            .from("Transacao")
            .select("tipo, valor, data")
            .eq("usuarioId", payload.userId)
            .lt("data", range.start.toISOString());

          (anteriores || []).forEach((item: any) => {
            saldoInicial += item.tipo === "receita" ? item.valor : -item.valor;
          });
        }

        const totalReceitas = (transacoes || [])
          .filter((t: any) => t.tipo === "receita")
          .reduce((acc: number, t: any) => acc + t.valor, 0);
        const totalDespesas = (transacoes || [])
          .filter((t: any) => t.tipo === "despesa")
          .reduce((acc: number, t: any) => acc + t.valor, 0);
        const saldoFinal = saldoInicial + totalReceitas - totalDespesas;

        const pdfBytes = await buildExtratoPdf({
          usuario: {
            nome: usuario?.nome || null,
            email: usuario?.email || null,
          },
          periodoLabel: formatDateRangeLabel(range),
          saldoInicial,
          totalReceitas,
          totalDespesas,
          saldoFinal,
          transacoes: transacoesOrdenadas.map((t: any) => ({
            data: t.data,
            descricao: t.descricao,
            tipo: t.tipo,
            valor: t.valor,
            categoriaNome: t.categoria?.nome ?? null,
          })),
        });

        const base64 = base64Encode(pdfBytes);
        if (encoding === "base64") {
          return new Response(base64, {
            status: 200,
            headers: {
              "Content-Type": "text/plain",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }

        return new Response(pdfBytes, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Access-Control-Allow-Origin": "*",
            "Content-Disposition": "attachment; filename=financia-extrato.pdf",
          },
        });
      }

      return jsonResponse({ transacoes, objetivos, categorias });
    }

    return jsonResponse({ error: "Rota nao encontrada.", code: "NOT_FOUND" }, 404);
  } catch (err) {
    return handleError(err);
  }
});
