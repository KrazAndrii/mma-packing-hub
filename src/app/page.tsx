"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Sidebar, type View } from "@/components/Sidebar";
import { ProductDataPanel } from "@/components/ProductDataPanel";
import { UtpPanel } from "@/components/UtpPanel";
import { StickerPanel } from "@/components/StickerPanel";
import {
  BarcodePanel,
  CopyRowPanel,
  EngravingPanel,
  ExportPanel,
  SpecsPanel,
  TranslationsPanel,
  ValidationBar,
} from "@/components/OutputPanels";
import { SettingsPanel } from "@/components/SettingsPanel";
import { getCategory } from "@/lib/categories";
import { getProfile } from "@/lib/profiles";
import { runRules } from "@/lib/rules/engine";
import { activeVariant } from "@/lib/defaults";

const TITLES: Record<View, string> = {
  data: "Дані товару",
  engraving: "Гравіювання",
  specs: "Специфікації",
  translations: "Переклади",
  utp: "УТП",
  sticker: "Стікер",
  barcode: "Штрихкод",
  check: "Перевірка",
  export: "Експорт",
  settings: "Налаштування",
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<View>("data");
  const products = useAppStore((s) => s.products);
  const activeId = useAppStore((s) => s.activeId);
  const setActive = useAppStore((s) => s.setActive);
  const brandId = useAppStore((s) => s.brandId);
  const categories = useAppStore((s) => s.categories);
  const rules = useAppStore((s) => s.rules);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!activeId && products[0]) setActive(products[0].id);
  }, [activeId, products, setActive]);

  if (!mounted) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-slate-400">Завантаження…</main>;
  }

  const product = products.find((p) => p.id === activeId) ?? null;
  const category = getCategory(categories, product?.category ?? "azu");
  const profile = getProfile(brandId);
  const errors = product
    ? runRules(product.spec, rules, profile).filter((r) => !r.passed && r.severity === "error").length
    : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar view={view} onView={setView} />
      <main className="flex min-w-0 flex-1 flex-col bg-[var(--background)]">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border)] bg-white px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">{TITLES[view]}</span>
            {view !== "settings" && product ? (
              <>
                <span className="text-slate-300">/</span>
                <span className="truncate text-sm text-slate-500">{product.spec.model || "без моделі"}</span>
                <span className="hidden truncate rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500 sm:inline">
                  {category.uk.replace(/\s*\(.*\)/, "")}
                </span>
              </>
            ) : null}
          </div>
          {view !== "settings" && product ? (
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span>EAN: {activeVariant(product)?.ean13 || "—"}</span>
              {errors ? <span className="rounded bg-red-50 px-2 py-0.5 font-medium text-red-600">{errors} помилок</span> : null}
              <span className="hidden rounded bg-slate-100 px-2 py-0.5 sm:inline">{profile.name}</span>
            </div>
          ) : null}
        </header>
        {view !== "settings" ? <ValidationBar /> : null}
        <div key={view} className="panel-enter min-h-0 flex-1 overflow-auto">
          {view === "settings" ? <SettingsPanel /> : null}
          {view === "data" ? <ProductDataPanel /> : null}
          {view === "engraving" ? <EngravingPanel /> : null}
          {view === "specs" ? <SpecsPanel /> : null}
          {view === "translations" ? <TranslationsPanel /> : null}
          {view === "utp" ? <UtpPanel /> : null}
          {view === "sticker" ? <StickerPanel /> : null}
          {view === "barcode" ? <BarcodePanel /> : null}
          {view === "export" ? (
            <div>
              <ExportPanel />
              <div className="px-4 pb-6">
                <CopyRowPanel />
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
