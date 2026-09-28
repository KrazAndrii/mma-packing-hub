import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface Body {
  summary?: string;
  category?: string;
  languages?: string[];
  apiKey?: string;
  model?: string;
}

const LANG_NAMES: Record<string, string> = {
  EN: "English",
  UA: "Ukrainian",
  RO: "Romanian",
  BG: "Bulgarian",
  ES: "Spanish",
  PL: "Polish",
};

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
          "Немає API-ключа. Додайте безкоштовний ключ Google AI Studio у налаштуваннях або змінну середовища GEMINI_API_KEY на Vercel.",
      },
      { status: 400 },
    );
  }

  const model = body.model || "gemini-2.0-flash";
  const languages = (body.languages || ["EN", "UA"]).slice(0, 8);
  const langList = languages.map((l) => `${l} (${LANG_NAMES[l] ?? l})`).join(", ");

  const prompt = [
    "Ти — досвідчений маркетолог у сфері мобільних аксесуарів та зарядних пристроїв (бренди Ridea, Yoki, iNobi).",
    "На основі технічних специфікацій товару згенеруй короткі маркетингові переваги (bullet points) для пакування.",
    "Правила: 3-5 пунктів на мову; кожен пункт до 60 символів; без вигаданих характеристик; лише факти зі специфікації; без символів-емодзі; без лапок-ялинок.",
    `Мови: ${langList}.`,
    "Поверни ВИКЛЮЧНО валідний JSON без пояснень у форматі: {\"EN\": [\"...\"], \"UA\": [\"...\"]}.",
    "",
    "Специфікація товару:",
    body.summary || "",
  ].join("\n");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, responseMimeType: "application/json" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { ok: false, error: `ШІ-провайдер повернув помилку ${res.status}: ${errText.slice(0, 300)}` },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let bullets: Record<string, string[]>;
    try {
      bullets = JSON.parse(cleaned) as Record<string, string[]>;
    } catch {
      return NextResponse.json({ ok: false, error: "ШІ повернув невалідний JSON" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, bullets });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Помилка звернення до ШІ" },
      { status: 500 },
    );
  }
}
