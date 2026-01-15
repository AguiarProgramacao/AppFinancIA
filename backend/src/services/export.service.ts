import { endOfDay, endOfMonth, startOfDay, startOfMonth, subMonths, subYears } from "date-fns";
import PDFDocument from "pdfkit";
import { prisma } from "../prisma/client";

interface ExportRange {
  start?: Date;
  end?: Date;
}

function csvValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function parseDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function resolveExportRange(params: {
  period?: string;
  start?: string;
  end?: string;
}): ExportRange | undefined {
  const startRaw = parseDate(params.start);
  const endRaw = parseDate(params.end);

  let start = startRaw;
  let end = endRaw;

  if (!start && !end && params.period) {
    const now = new Date();
    if (params.period === "month") {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else if (params.period === "3months") {
      start = startOfMonth(subMonths(now, 2));
      end = endOfDay(now);
    } else if (params.period === "6months") {
      start = startOfMonth(subMonths(now, 5));
      end = endOfDay(now);
    } else if (params.period === "year") {
      start = startOfMonth(subYears(now, 1));
      end = endOfDay(now);
    }
  }

  if (!start && !end) {
    return undefined;
  }

  return {
    start: start ? startOfDay(start) : undefined,
    end: end ? endOfDay(end) : undefined,
  };
}

function buildDateFilter(range?: ExportRange) {
  if (!range?.start && !range?.end) return undefined;
  return {
    ...(range.start ? { gte: range.start } : {}),
    ...(range.end ? { lte: range.end } : {}),
  };
}

function formatDateShort(value: Date) {
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const year = value.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

function truncate(text: string | null | undefined, max = 38) {
  if (!text) return "-";
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

export async function getExportSummary(userId: string, range?: ExportRange) {
  const dataFilter = buildDateFilter(range);

  const [transacoes, objetivos] = await Promise.all([
    prisma.transacao.count({
      where: {
        usuarioId: userId,
        ...(dataFilter ? { data: dataFilter } : {}),
      },
    }),
    prisma.objetivo.count({
      where: {
        usuarioId: userId,
        ...(dataFilter ? { dataLimite: dataFilter } : {}),
      },
    }),
  ]);

  return { transacoes, objetivos };
}

export async function getExportData(userId: string, range?: ExportRange) {
  const dataFilter = buildDateFilter(range);

  const [transacoes, objetivos, categorias] = await Promise.all([
    prisma.transacao.findMany({
      where: {
        usuarioId: userId,
        ...(dataFilter ? { data: dataFilter } : {}),
      },
      include: {
        categoria: true,
      },
      orderBy: { data: "desc" },
    }),
    prisma.objetivo.findMany({
      where: {
        usuarioId: userId,
        ...(dataFilter ? { dataLimite: dataFilter } : {}),
      },
      include: { aportes: true },
      orderBy: { dataLimite: "asc" },
    }),
    prisma.categoria.findMany({
      where: { usuarioId: userId },
      orderBy: { nome: "asc" },
    }),
  ]);

  return { transacoes, objetivos, categorias };
}

export async function getExportCsv(userId: string, range?: ExportRange) {
  const { transacoes, objetivos, categorias } = await getExportData(
    userId,
    range
  );

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

  const transacoesRows = transacoes.map((item) => [
    item.id,
    item.tipo,
    item.valor,
    item.descricao,
    item.data.toISOString(),
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

  const objetivosRows = objetivos.map((item) => [
    item.id,
    item.nome,
    item.meta,
    item.economizado,
    item.dataLimite.toISOString(),
    item.criadoEm.toISOString(),
  ]);

  const categoriasHeader = ["id", "nome", "tipo", "cor"];
  const categoriasRows = categorias.map((item) => [
    item.id,
    item.nome,
    item.tipo,
    item.cor,
  ]);

  const toCsv = (header: string[], rows: any[][]) => {
    const lines = [header.join(",")];
    rows.forEach((row) => {
      lines.push(row.map(csvValue).join(","));
    });
    return lines.join("\n");
  };

  return [
    "transacoes",
    toCsv(transacoesHeader, transacoesRows),
    "",
    "objetivos",
    toCsv(objetivosHeader, objetivosRows),
    "",
    "categorias",
    toCsv(categoriasHeader, categoriasRows),
  ].join("\n");
}

export async function getExportPdf(userId: string, range?: ExportRange) {
  const dataFilter = buildDateFilter(range);
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { nome: true, email: true },
  });

  const transacoes = await prisma.transacao.findMany({
    where: {
      usuarioId: userId,
      ...(dataFilter ? { data: dataFilter } : {}),
    },
    include: { categoria: true },
    orderBy: { data: "asc" },
  });

  let saldoInicial = 0;
  if (range?.start) {
    const [receitasAntes, despesasAntes] = await Promise.all([
      prisma.transacao.aggregate({
        where: { usuarioId: userId, tipo: "receita", data: { lt: range.start } },
        _sum: { valor: true },
      }),
      prisma.transacao.aggregate({
        where: { usuarioId: userId, tipo: "despesa", data: { lt: range.start } },
        _sum: { valor: true },
      }),
    ]);
    saldoInicial =
      (receitasAntes._sum.valor || 0) - (despesasAntes._sum.valor || 0);
  }

  const totalReceitas = transacoes
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + t.valor, 0);
  const totalDespesas = transacoes
    .filter((t) => t.tipo === "despesa")
    .reduce((acc, t) => acc + t.valor, 0);
  const saldoFinal = saldoInicial + totalReceitas - totalDespesas;

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text("Extrato financeiro", { align: "left" });
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor("#555555");
    doc.text(`Usuario: ${user?.nome || "-"} (${user?.email || "-"})`);

    const periodoLabel =
      range?.start || range?.end
        ? `${range?.start ? formatDateShort(range.start) : "--"} ate ${
            range?.end ? formatDateShort(range.end) : "--"
          }`
        : "Todo historico";
    doc.text(`Periodo: ${periodoLabel}`);
    doc.moveDown(1);

    doc.fillColor("#111111").fontSize(12).text("Resumo");
    doc.moveDown(0.2);
    doc.fontSize(10);
    doc.text(`Saldo inicial: ${formatCurrency(saldoInicial)}`);
    doc.text(`Total receitas: ${formatCurrency(totalReceitas)}`);
    doc.text(`Total despesas: ${formatCurrency(totalDespesas)}`);
    doc.text(`Saldo final: ${formatCurrency(saldoFinal)}`);
    doc.moveDown(1);

    const startX = doc.x;
    const tableTop = doc.y;
    const colDate = 65;
    const colDesc = 190;
    const colCat = 110;
    const colVal = 70;
    const colSaldo = 80;
    const rowHeight = 18;

    doc.rect(startX, tableTop, 515, rowHeight).fill("#F3F4F6");
    doc.fillColor("#111111").fontSize(9);
    doc.text("Data", startX + 4, tableTop + 5, { width: colDate - 8 });
    doc.text("Descricao", startX + colDate + 4, tableTop + 5, {
      width: colDesc - 8,
    });
    doc.text("Categoria", startX + colDate + colDesc + 4, tableTop + 5, {
      width: colCat - 8,
    });
    doc.text("Valor", startX + colDate + colDesc + colCat + 4, tableTop + 5, {
      width: colVal - 8,
      align: "right",
    });
    doc.text(
      "Saldo",
      startX + colDate + colDesc + colCat + colVal + 4,
      tableTop + 5,
      {
        width: colSaldo - 8,
        align: "right",
      }
    );

    let y = tableTop + rowHeight;
    let running = saldoInicial;

    transacoes.forEach((t) => {
      if (y + rowHeight > doc.page.height - 60) {
        doc.addPage();
        y = doc.y;
      }

      running += t.tipo === "receita" ? t.valor : -t.valor;

      doc
        .fillColor("#111111")
        .fontSize(9)
        .text(formatDateShort(t.data), startX + 4, y + 5, {
          width: colDate - 8,
        });
      doc.text(truncate(t.descricao), startX + colDate + 4, y + 5, {
        width: colDesc - 8,
      });
      doc.text(truncate(t.categoria?.nome), startX + colDate + colDesc + 4, y + 5, {
        width: colCat - 8,
      });
      doc.text(
        formatCurrency(t.tipo === "despesa" ? -t.valor : t.valor),
        startX + colDate + colDesc + colCat + 4,
        y + 5,
        {
          width: colVal - 8,
          align: "right",
        }
      );
      doc.text(
        formatCurrency(running),
        startX + colDate + colDesc + colCat + colVal + 4,
        y + 5,
        {
          width: colSaldo - 8,
          align: "right",
        }
      );

      doc
        .strokeColor("#E5E7EB")
        .lineWidth(0.5)
        .moveTo(startX, y + rowHeight)
        .lineTo(startX + 515, y + rowHeight)
        .stroke();

      y += rowHeight;
    });

    doc.end();
  });
}
