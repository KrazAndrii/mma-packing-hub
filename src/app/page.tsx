"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Sidebar, type View } from "@/components/Sidebar";
import { ProductDataPanel } from "@/components/ProductDataPanel";
import { UtpPanel } from "@/components/UtpPanel";
import { StickerPanel } from "@/components/StickerPanel";
import {
  BarcodePanel,
  CheckPanel,
  CopyRowPanel,
  EngravingPanel,
  ExportPanel,
  SpecsPanel,
  TranslationsPanel,
} from "@/components/OutputPanels";
import { SettingsPanel } from "@/components/SettingsPanel";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<View>("data");
  const products = useAppStore((s) => s.products);
  const activeId = useAppStore((s) => s.activeId);
  const setActive = useAppStore((s) => s.setActive);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!activeId && products[0]) setActive(products[0].id);
  }, [activeId, products, setActive]);

  if (!mounted) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">Завантаження…</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar view={view} onView={setView} />
      <main className="min-w-0 flex-1 overflow-auto bg-[var(--background)]">
        {view === "settings" ? <SettingsPanel /> : null}
        {view === "data" ? <ProductDataPanel /> : null}
        {view === "engraving" ? <EngravingPanel /> : null}
        {view === "specs" ? <SpecsPanel /> : null}
        {view === "translations" ? <TranslationsPanel /> : null}
        {view === "utp" ? <UtpPanel /> : null}
        {view === "sticker" ? <StickerPanel /> : null}
        {view === "barcode" ? <BarcodePanel /> : null}
        {view === "check" ? <CheckPanel /> : null}
        {view === "export" ? (
          <div>
            <ExportPanel />
            <div className="px-4 pb-6">
              <CopyRowPanel />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
