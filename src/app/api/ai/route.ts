import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface Body {
  action?: "utp" | "parse" | "translate";
  summary?: string;
  rawSpec?: string;
  bullets?: string[];
  languages?: string[];
  apiKey?: string;
  model?: string;
}

const LANG_NAMES: Record<string, string> = {
  EN: "English",
  DE: "German",
  ES: "Spanish",
  FR: "French",
  UA: "Ukrainian",
  IT: "Italian",
  RO: "Romanian",
  PL: "Polish",
  BG: "Bulgarian",
};

function buildPrompt(body: Body): string | null {
  if (body.action === "utp") {
    return [
      "Ти маркетолог мобільних аксесуарів (бренди Ridea, Yoki, iNobi).",
      "Створи 3-5 коротких англійських значків-переваг (УТП) для пакування.",
      "Кожен значок максимум 3 слова, без емодзі, без вигаданих характеристик.",
      'Поверни ВИКЛЮЧНО валідний JSON-масив рядків, напр.: ["20W Fast Charge","Qi2 Certified","Ultra Compact"].',
      "",
      "Специфікація:",
      body.summary || "",
    ].join("\n");
  }
  if (body.action === "parse") {
    return [
      "Ти парсер специфікацій електроніки. Мови тексту можуть бути мішані (RU/UA/EN).",
      "Розбери текст у структурований JSON. Поверни ЛИШЕ ті поля, які реально присутні.",
      "Схема: { model, totalOutputW, input:{kind:'AC'|'DC',voltage,current,frequency,maxW},",
      " ports:[{type,direction:'input'|'output',outputs:[{volts,amps}],maxW,protocols:[]}],",
      " battery:{capacityMah,voltage,wh}, conversionRate, magneticForce, driverSize, audioCodecs,",
      " dataTransfer, technologies:[], material, dimensions:{length,width,height}, weightG, certifications:[] }.",
      "Числа — числами, без одиниць. Негайно поверни ТІЛЬКИ валідний JSON без пояснень.",
      "",
      "Текст:",
      body.rawSpec || "",
    ].join("\n");
  }
  if (body.action === "translate") {
    const langs = (body.languages || []).map((l) => `${l} (${LANG_NAMES[l] ?? l})`).join(", ");
    return [
      "Переклади маркетингові буллети для пакування електроніки. Збережи зміст і довжину.",
      `Мови: ${langs}.`,
      "Поверни ЛИШЕ валідний JSON: {\"EN\":[\"...\"],\"UA\":[\"...\"]}.",
      "",
      "Буллети:",
      JSON.stringify(body.bullets || [], null, 2),
    ].join("\n");
  }
  return null;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Некоректний запит" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || body.apiKey || "";
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Немає ключа Google AI Studio. Додайте його в «Налаштуваннях» або змінну GEMINI_API_KEY на Vercel.",
      },
      { status: 400 },
    );
  }

  const prompt = buildPrompt(body);
  if (!prompt) {
    return NextResponse.json({ ok: false, error: "Невідома дія" }, { status: 400 });
  }

  const model = body.model || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, responseMimeType: "application/json" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { ok: false, error: `ШІ повернув помилку ${res.status}: ${errText.slice(0, 300)}` },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").replace(/```json|```/g, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ ok: false, error: "ШІ повернув невалідний JSON" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, data: parsed });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Помилка звернення до ШІ" },
      { status: 500 },
    );
  }
}
