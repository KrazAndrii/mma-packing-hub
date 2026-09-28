"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getProfile } from "@/lib/profiles";
import { getCategory } from "@/lib/categories";
import { activeVariant } from "@/lib/defaults";
import { runRules } from "@/lib/rules/engine";
import { buildSpecLines } from "@/lib/generate/specs";
import { specLinesToText } from "@/lib/i18n/translate";
import { buildEngraving } from "@/lib/generate/engraving";
import { buildEngravingPlan } from "@/lib/generate/engravingPlan";
import { buildBarcode, type BarcodeResult } from "@/lib/generate/barcode";
import { buildExportZip, downloadBlob, downloadText } from "@/lib/export";
import type { EngravingResult, Language } from "@/lib/types";
import { Badge, Button, CopyButton, CopyableText, Section, StatusDot, TextInput } from "./ui";

function useActive() {
  const products = useAppStore((s) => s.products);
  const activeId = useAppStore((s) => s.activeId);
  const settings = useAppStore((s) => s.settings);
  const rules = useAppStore((s) => s.rules);
  const categories = useAppStore((s) => s.categories);
  const brandId = useAppStore((s) => s.brandId);
  const product = products.find((p) => p.id === activeId) ?? null;
  const profile = getProfile(brandId);
  const category = getCategory(categories, product?.category ?? "azu");
  return { product, settings, rules, profile, category };
}

export function EngravingPanel() {
  const { product, settings } = useActive();
  const [result, setResult] = useState<EngravingResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    setError("");
    buildEngraving(product.spec, getProfile(useAppStore.getState().brandId), {
      format: settings.engravingFormat,
      portLineStyle: "suffix",
    })
      .then((r) => !cancelled && setResult(r))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : "Помилка"));
    return () => {
      cancelled = true;
    };
  }, [product, settings.engravingFormat, settings.portLineStyle]);

  if (!product) return <div className="p-6 text-sm text-slate-500">Оберіть товар.</div>;

  const profile = getProfile(useAppStore.getState().brandId);
  const plan = buildEngravingPlan(product.spec, profile, {
    format: settings.engravingFormat,
    portLineStyle: settings.portLineStyle,
  });

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={!result}
          onClick={() => result && downloadText(result.svg, `${product.spec.model || "graviuvannia"}-${settings.engravingFormat}.svg`, "image/svg+xml")}
        >
          Завантажити SVG
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!result}
          onClick={() => result && downloadText(result.dxf, `${product.spec.model || "graviuvannia"}-${settings.engravingFormat}.dxf`, "application/dxf")}
        >
          Завантажити DXF
        </Button>
        <CopyButton text={plan.text} label="Копіювати текст" />
        <span className="text-xs text-slate-400">
          Режим: {settings.engravingFormat === "full" ? "повні пробіли" : "компактний"}
        </span>
      </div>
      {error ? <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="field-label mb-1">Векторний макет {result ? `(${result.widthMm}×${result.heightMm} мм)` : ""}</p>
          <div className="svg-preview flex min-h-[320px] items-center justify-center rounded-lg border border-[var(--border)] bg-white p-4">
            {result ? <div dangerouslySetInnerHTML={{ __html: result.svg }} /> : <span className="text-sm text-slate-400">Генерація…</span>}
          </div>
        </div>
        <CopyableText title="Текст гравіювання" text={plan.text} rows={16} />
      </div>
    </div>
  );
}

export function SpecsPanel() {
  const { product } = useActive();
  if (!product) return <div className="p-6 text-sm text-slate-500">Оберіть товар.</div>;
  const ua = specLinesToText(buildSpecLines(product.spec, "UA"));
  return (
    <div className="space-y-4 p-4">
      <p className="text-xs text-slate-500">Вичитані специфікації українською — для стовпця «Спеки» у таблиці.</p>
      <CopyableText title="Специфікації (UA)" text={ua} rows={18} />
    </div>
  );
}

export function TranslationsPanel() {
  const { product, settings } = useActive();
  if (!product) return <div className="p-6 text-sm text-slate-500">Оберіть товар.</div>;

  const download = () => {
    const md = settings.languages
      .map((l) => `## ${l}\n\n${specLinesToText(buildSpecLines(product.spec, l as Language))}`)
      .join("\n\n");
    downloadText(md, `${product.spec.model || "pereklady"}.md`, "text/markdown;charset=utf-8");
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={download}>
          Завантажити всі переклади
        </Button>
        <span className="text-xs text-slate-400">Мови: {settings.languages.join(", ")}</span>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {settings.languages.map((lang) => (
          <CopyableText
            key={lang}
            title={lang}
            text={specLinesToText(buildSpecLines(product.spec, lang as Language))}
            rows={12}
          />
        ))}
      </div>
    </div>
  );
}

export function BarcodePanel() {
  const { product } = useActive();
  const updateVariant = useAppStore((s) => s.updateVariant);
  const [result, setResult] = useState<BarcodeResult | null>(null);
  const [batch, setBatch] = useState(false);

  const variant = product ? activeVariant(product) : null;

  useEffect(() => {
    if (!variant) return;
    let cancelled = false;
    buildBarcode(variant.ean13).then((r) => !cancelled && setResult(r));
    return () => {
      cancelled = true;
    };
  }, [variant]);

  if (!product || !variant) return <div className="p-6 text-sm text-slate-500">Оберіть товар.</div>;

  const allProducts = useAppStore.getState().products;

  return (
    <div className="space-y-4 p-4">
      <Section
        title="Штрихкод EAN-13"
        subtitle="Для стікера на коробку"
        right={
          <Button size="sm" variant="secondary" onClick={() => setBatch((v) => !v)}>
            {batch ? "Сховати список" : "Усі товари"}
          </Button>
        }
      >
        <div className="max-w-xs">
          <TextInput
            value={variant.ean13}
            onChange={(v) => updateVariant(product.id, variant.id, { ean13: v.replace(/[^\d]/g, "").slice(0, 13) })}
            placeholder="4820000000000"
          />
        </div>
        <p className="mt-1 text-[11px] text-slate-400">13 цифр, контрольна цифра перевіряється автоматично.</p>
        {result && !result.valid && variant.ean13 ? (
          <p className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-800">{result.reason}</p>
        ) : null}
        {result?.valid ? (
          <div className="mt-3 space-y-3">
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => downloadText(result.svg, `${product.spec.model || "barcode"}.svg`, "image/svg+xml")}>
                Завантажити SVG
              </Button>
              <button
                type="button"
                className="rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs hover:bg-slate-50"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = result.pngDataUrl;
                  a.download = `${product.spec.model || "barcode"}.png`;
                  a.click();
                }}
              >
                Завантажити PNG
              </button>
            </div>
            <div className="svg-preview flex justify-center rounded-lg border border-[var(--border)] bg-white p-6">
              <div dangerouslySetInnerHTML={{ __html: result.svg }} />
            </div>
          </div>
        ) : null}
      </Section>

      {batch ? (
        <Section title="Штрихкоди всіх товарів">
          <div className="space-y-2">
            {allProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded border border-[var(--border)] px-3 py-2 text-sm">
                <span>{p.spec.model || p.name || "—"}</span>
                <span className="font-mono text-xs text-slate-600">{activeVariant(p)?.ean13 || "немає"}</span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                downloadText(
                  allProducts.map((p) => `${p.spec.model || p.name}\t${activeVariant(p)?.ean13 ?? ""}`).join("\n"),
                  "ean13-vsi.txt",
                )
              }
            >
              Завантажити список (TSV)
            </Button>
          </div>
        </Section>
      ) : null}
    </div>
  );
}

export function ValidationBar() {
  const { product, rules, profile } = useActive();
  const [open, setOpen] = useState(false);
  if (!product) return null;

  const results = runRules(product.spec, rules, profile);
  const issues = results.filter((r) => !r.passed);
  const errors = issues.filter((r) => r.severity === "error").length;
  const warnings = issues.filter((r) => r.severity === "warning").length;

  const tone = errors ? "red" : warnings ? "amber" : "green";
  const toneClasses: Record<string, string> = {
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    green: "border-green-200 bg-green-50 text-green-700",
  };

  const report = issues
    .map((r) => `[${r.severity === "error" ? "ПОМИЛКА" : "УВАГА"}] ${r.title}: ${r.message}${r.details?.length ? " — " + r.details.join("; ") : ""}`)
    .join("\n");

  return (
    <div className={`border-b ${toneClasses[tone]}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-1.5 text-left text-xs"
      >
        <span className="flex items-center gap-2">
          <StatusDot severity={errors ? "error" : warnings ? "warning" : "ok"} />
          Перевірка в реальному часі:{" "}
          {issues.length === 0 ? "зауважень немає" : `${errors} помилок, ${warnings} попереджень`}
        </span>
        {issues.length ? <span className="opacity-70">{open ? "згорнути" : "детальніше"}</span> : null}
      </button>
      {open && issues.length ? (
        <div className="fade-in space-y-1 px-4 pb-2">
          {issues.map((r) => (
            <div key={r.ruleId} className="text-[11px]">
              <span className="font-semibold">{r.title}:</span> {r.message}
              {r.details?.length ? <span className="opacity-80"> — {r.details.join("; ")}</span> : null}
            </div>
          ))}
          <div className="pt-1">
            <CopyButton text={report} label="Копіювати зауваження для фабрики" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function tsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function CopyRowPanel() {
  const { product, settings, profile } = useActive();
  if (!product) return <div className="p-6 text-sm text-slate-500">Оберіть товар.</div>;

  const engraving = buildEngravingPlan(product.spec, profile, {
    format: settings.engravingFormat,
    portLineStyle: settings.portLineStyle,
  }).text;
  const specs = specLinesToText(buildSpecLines(product.spec, "UA"));
  const translations = settings.languages
    .map((l) => `${l}:\n${specLinesToText(buildSpecLines(product.spec, l as Language))}`)
    .join("\n\n");
  const ean = activeVariant(product)?.ean13 ?? "";
  const sticker = product.stickerText;

  const columns = [engraving, specs, translations, ean, sticker];
  const row = columns.map(tsvCell).join("\t");

  return (
    <Section title="Копіювання рядка у таблицю" subtitle="Порядок: Гравіювання / Спеки / Переклад / Штрихкод / Стікер">
      <div className="mb-3 flex flex-wrap gap-2">
        <CopyButton text={row} label="Копіювати весь рядок (для Excel)" />
        <CopyButton text={engraving} label="Гравіювання" />
        <CopyButton text={specs} label="Спеки" />
        <CopyButton text={translations} label="Переклад" />
        <CopyButton text={ean} label="Штрихкод" />
        <CopyButton text={sticker} label="Стікер" />
      </div>
      <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
        <Badge tone="blue">Гравіювання</Badge>
        <Badge tone="blue">Спеки</Badge>
        <Badge tone="blue">Переклад</Badge>
        <Badge tone="blue">Штрихкод</Badge>
        <Badge tone="blue">Стікер</Badge>
      </div>
    </Section>
  );
}

export function ExportPanel() {
  const { product, settings, profile } = useActive();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  if (!product) return <div className="p-6 text-sm text-slate-500">Оберіть товар.</div>;

  const build = async () => {
    setBusy(true);
    setNote("");
    try {
      const [full, compact] = await Promise.all([
        buildEngraving(product.spec, profile, { format: "full", portLineStyle: settings.portLineStyle }),
        buildEngraving(product.spec, profile, { format: "compact", portLineStyle: settings.portLineStyle }),
      ]);
      const variant = activeVariant(product);
      const barcode = await buildBarcode(variant?.ean13 ?? "");
      const blob = await buildExportZip({
        spec: product.spec,
        profileName: profile.name,
        engravingFullSvg: full.svg,
        engravingFullDxf: full.dxf,
        engravingCompactSvg: compact.svg,
        engravingCompactDxf: compact.dxf,
        engravingTextFull: buildEngravingPlan(product.spec, profile, { format: "full", portLineStyle: settings.portLineStyle }).text,
        stickerText: product.stickerText,
        barcodeSvg: barcode.valid ? barcode.svg : "",
        barcodePngDataUrl: barcode.valid ? barcode.pngDataUrl : "",
        translations: Object.fromEntries(
          settings.languages.map((l) => [l, buildSpecLines(product.spec, l as Language)]),
        ),
        marketing: Object.fromEntries(settings.languages.map((l) => [l, product.utpBadges])),
      });
      downloadBlob(blob, `${profile.name}_${product.spec.model || "product"}.zip`);
      setNote("Пакет завантажено.");
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Помилка");
    } finally {
      setBusy(false);
    }
  };

  const backup = () => {
    const state = useAppStore.getState();
    downloadText(
      JSON.stringify({ products: state.products, categories: state.categories, settings: state.settings, rules: state.rules }, null, 2),
      "mma-packing-hub-backup.json",
      "application/json",
    );
  };

  return (
    <div className="space-y-4 p-4">
      <Section title="Пакет файлів по товару" subtitle="Гравіювання, стікер, штрихкод, переклади">
        <Button onClick={build} disabled={busy}>
          {busy ? "Формування…" : "Сформувати ZIP"}
        </Button>
        {note ? <p className="mt-2 text-xs text-slate-600">{note}</p> : null}
      </Section>
      <Section title="Резервна копія всіх товарів">
        <Button variant="secondary" onClick={backup}>
          Завантажити резервну копію (JSON)
        </Button>
      </Section>
    </div>
  );
}
