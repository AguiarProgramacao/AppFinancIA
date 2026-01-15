import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatCurrency(value: number) {
  return (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function truncate(text: string | null | undefined, max = 32) {
  if (!text) return "-";
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

export async function buildExtratoPdf(params: {
  usuario: { nome: string | null; email: string | null };
  periodoLabel: string;
  saldoInicial: number;
  totalReceitas: number;
  totalDespesas: number;
  saldoFinal: number;
  transacoes: Array<{
    data: string;
    descricao: string | null;
    tipo: string;
    valor: number;
    categoriaNome?: string | null;
  }>;
}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const addPage = () => doc.addPage([595, 842]);
  let page = addPage();
  let y = 800;

  const write = (text: string, size = 10, bold = false) => {
    const useFont = bold ? fontBold : font;
    page.drawText(text, { x: 40, y, size, font: useFont, color: rgb(0, 0, 0) });
    y -= size + 6;
  };

  write("Extrato financeiro", 16, true);
  write(`Usuario: ${params.usuario.nome || "-"} (${params.usuario.email || "-"})`, 10);
  write(`Periodo: ${params.periodoLabel}`, 10);
  y -= 6;
  write("Resumo", 12, true);
  write(`Saldo inicial: ${formatCurrency(params.saldoInicial)}`, 10);
  write(`Total receitas: ${formatCurrency(params.totalReceitas)}`, 10);
  write(`Total despesas: ${formatCurrency(params.totalDespesas)}`, 10);
  write(`Saldo final: ${formatCurrency(params.saldoFinal)}`, 10);
  y -= 10;

  const headerY = y;
  page.drawRectangle({
    x: 40,
    y: headerY - 4,
    width: 515,
    height: 18,
    color: rgb(0.94, 0.95, 0.97),
  });

  page.drawText("Data", { x: 44, y: headerY, size: 9, font: fontBold });
  page.drawText("Descricao", { x: 110, y: headerY, size: 9, font: fontBold });
  page.drawText("Categoria", { x: 305, y: headerY, size: 9, font: fontBold });
  page.drawText("Valor", { x: 455, y: headerY, size: 9, font: fontBold });
  page.drawText("Saldo", { x: 510, y: headerY, size: 9, font: fontBold });

  y = headerY - 20;
  let running = params.saldoInicial;

  for (const item of params.transacoes) {
    if (y < 60) {
      page = addPage();
      y = 800;
    }

    running += item.tipo === "receita" ? item.valor : -item.valor;
    const lineSaldo = formatCurrency(running);
    const lineValor =
      item.tipo === "despesa"
        ? `-${formatCurrency(item.valor)}`
        : formatCurrency(item.valor);

    page.drawText(formatDate(new Date(item.data)), { x: 44, y, size: 9, font });
    page.drawText(truncate(item.descricao), { x: 110, y, size: 9, font });
    page.drawText(truncate(item.categoriaNome), { x: 305, y, size: 9, font });
    page.drawText(lineValor, { x: 455, y, size: 9, font });
    page.drawText(lineSaldo, { x: 510, y, size: 9, font });
    y -= 16;
  }

  return await doc.save();
}
