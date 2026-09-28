"use client";

import { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { LANGUAGES } from "@/lib/i18n/locales";
import { buildSpecTranslations, buildMarketingBullets, specLinesToText } from "@/lib/i18n/translate";
import { generateBulletsAI } from "@/lib/ai/provider";
import { downloadText } from "@/lib/export";
import { Button, Field, TextArea, TextInput } from "./ui";

export function TranslationsPanel() {
  const spec = useProjectStore((s) => s.spec);
  const aiApiKey = useProjectStore((s) => s.aiApiKey);
  const aiModel = useProjectStore((s) => s.aiModel);
  const setAiKey = useProjectStore((s) => s.setAiKey);
  const setAiModel = useProjectStore((s) => s.setAiModel);
  const setBullets = useProjectStore((s) => s.setBullets);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const langs = spec.languages;
  const translations = buildSpecTranslations(spec, langs);

  const bulletsFor = (lang: (typeof langs)[number]) =>
    spec.marketingBullets[lang]?.length ? spec.marketingBullets[lang]! : buildMarketingBullets(spec, lang);

  const runAi = async () => {
    setBusy(true);
    setMessage("");
    const res = await generateBulletsAI(spec, langs, aiApiKey, aiModel);
    if (res.ok && res.bullets) {
      for (const lang of langs) {
        const b = res.bullets[lang];
        if (b?.length) setBullets(lang, b);
      }
      setMessage("Готово: ШІ оновив буллети.");
    } else {
      setMessage(res.error ?? "Не вдалося згенерувати.");
    }
    setBusy(false);
  };

  const downloadAll = () => {
    const md = langs
      .map((l) => `# ${l}\n\n${specLinesToText(translations[l] ?? [])}\n\n## Переваги\n${bulletsFor(l).map((b) => `- ${b}`).join("\n")}`)
      .join("\n\n---\n\n");
    downloadText(md, `${spec.model || "translations"}.md`, "text/markdown;charset=utf-8");
  };

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-lg border border-[var(--border)] bg-slate-50 p-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Google AI Studio API-ключ (безкоштовно)" hint="Зберігається лише у вашому браузері">
            <TextInput type="password" value={aiApiKey} onChange={setAiKey} placeholder="AIza..." />
          </Field>
          <Field label="Модель">
            <TextInput value={aiModel} onChange={setAiModel} placeholder="gemini-2.0-flash" />
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={runAi} disabled={busy}>
            {busy ? "Генерація…" : "Згенерувати буллети (ШІ)"}
          </Button>
          <Button size="sm" variant="secondary" onClick={downloadAll}>
            Завантажити переклади .md
          </Button>
          <span className="text-xs text-slate-500">
            Без ключа працює шаблонний генератор (завжди доступний офлайн).
          </span>
        </div>
        {message ? <p className="mt-2 text-xs text-slate-600">{message}</p> : null}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {langs.map((lang) => {
          const meta = LANGUAGES.find((l) => l.code === lang);
          return (
            <div key={lang} className="rounded-lg border border-[var(--border)] bg-white p-3">
              <p className="mb-2 text-sm font-semibold text-slate-800">
                {meta?.flag} {lang} — {meta?.label}
              </p>
              <pre className="mb-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-2 font-mono text-[11px] text-slate-600">
                {specLinesToText(translations[lang] ?? [])}
              </pre>
              <span className="field-label">Маркетингові буллети</span>
              <div className="mt-1">
                <TextArea
                  rows={4}
                  value={bulletsFor(lang).join("\n")}
                  onChange={(v) => setBullets(lang, v.split("\n").filter((x) => x.trim()))}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
