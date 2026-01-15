interface GeminiInsight {
  tipo: "controle" | "objetivo";
  titulo: string;
  mensagem: string;
}

interface GeminiContext {
  remuneracao: number;
  despesasMes: number;
  receitasMes: number;
  saldoMes: number;
  objetivoPrincipal?: {
    nome: string;
    meta: number;
    economizado: number;
    diasRestantes: number;
  };
}

export async function gerarInsightsComGemini(
  context: GeminiContext
): Promise<GeminiInsight[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const prompt = [
    "Voce e um assistente financeiro. Gere 2 insights curtos em pt-BR sem acentos.",
    "1 sobre controle financeiro baseado na remuneracao e gastos do mes.",
    "1 sobre objetivo financeiro baseado no objetivo principal.",
    "Responda SOMENTE com JSON valido no formato:",
    '[{"tipo":"controle","titulo":"...","mensagem":"..."},{"tipo":"objetivo","titulo":"...","mensagem":"..."}]',
    "Sem quebras de linha extras e sem texto fora do JSON.",
    "Contexto:",
    JSON.stringify(context),
  ].join(" ");

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      apiKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 256,
        },
      }),
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as any;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      return null;
    }
    const insights = parsed.filter(
      (item: any) =>
        item &&
        (item.tipo === "controle" || item.tipo === "objetivo") &&
        typeof item.titulo === "string" &&
        typeof item.mensagem === "string"
    );
    return insights.length ? insights : null;
  } catch {
    return null;
  }
}
