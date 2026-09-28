"use client";

import { useAppStore } from "@/store/useAppStore";
import { PROFILES, getProfile } from "@/lib/profiles";
import { getCategory } from "@/lib/categories";
import { Button, Select } from "./ui";

export type View =
  | "data"
  | "engraving"
  | "specs"
  | "translations"
  | "utp"
  | "sticker"
  | "barcode"
  | "check"
  | "export"
  | "settings";

const TOOLS: { id: View; label: string }[] = [
  { id: "data", label: "Дані товару" },
  { id: "engraving", label: "Гравіювання" },
  { id: "specs", label: "Специфікації" },
  { id: "translations", label: "Переклади" },
  { id: "utp", label: "УТП" },
  { id: "sticker", label: "Стікер" },
  { id: "barcode", label: "Штрихкод" },
  { id: "check", label: "Перевірка" },
  { id: "export", label: "Експорт" },
];

export function Sidebar({ view, onView }: { view: View; onView: (v: View) => void }) {
  const products = useAppStore((s) => s.products);
  const activeId = useAppStore((s) => s.activeId);
  const brandId = useAppStore((s) => s.brandId);
  const categories = useAppStore((s) => s.categories);
  const setActive = useAppStore((s) => s.setActive);
  const setBrandId = useAppStore((s) => s.setBrandId);
  const addProduct = useAppStore((s) => s.addProduct);
  const duplicateProduct = useAppStore((s) => s.duplicateProduct);
  const deleteProduct = useAppStore((s) => s.deleteProduct);

  const profile = getProfile(brandId);

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-[var(--border)] bg-white">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ background: profile.accent }}
          >
            MMA
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-slate-900">MMA Packing Hub</h1>
            <p className="text-[11px] text-slate-500">Пакування, гравіювання, маркування</p>
          </div>
        </div>
        <div className="mt-3">
          <Select<string>
            value={brandId}
            onChange={setBrandId}
            options={PROFILES.map((p) => ({ value: p.id, label: `Бренд: ${p.name}` }))}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="field-label">Товари ({products.length})</span>
          <Button size="sm" variant="secondary" onClick={addProduct}>
            + Товар
          </Button>
        </div>
        <div className="mt-2 min-h-0 flex-1 overflow-auto px-2 pb-2">
          {products.length === 0 ? (
            <p className="px-2 py-3 text-xs text-slate-400">Натисніть «+ Товар», щоб додати позицію.</p>
          ) : null}
          {products.map((p) => {
            const isActive = p.id === activeId;
            const cat = getCategory(categories, p.category);
            return (
              <div
                key={p.id}
                className={`group mb-1 rounded-lg border px-2 py-2 ${
                  isActive ? "border-blue-300 bg-blue-50" : "border-transparent hover:bg-slate-50"
                }`}
              >
                <button type="button" className="block w-full text-left" onClick={() => setActive(p.id)}>
                  <span className="block truncate text-sm font-medium text-slate-800">
                    {p.spec.model || p.name || "Без моделі"}
                  </span>
                  <span className="block truncate text-[11px] text-slate-500">{cat.uk}</span>
                </button>
                {isActive ? (
                  <div className="mt-1.5 flex gap-2">
                    <button
                      type="button"
                      className="text-[11px] text-slate-500 hover:text-blue-700"
                      onClick={() => duplicateProduct(p.id)}
                    >
                      Дублювати
                    </button>
                    <button
                      type="button"
                      className="text-[11px] text-slate-500 hover:text-red-600"
                      onClick={() => deleteProduct(p.id)}
                    >
                      Видалити
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="border-t border-[var(--border)] px-4 pt-3">
          <span className="field-label">Інструменти</span>
        </div>
        <nav className="overflow-auto px-2 pb-2 pt-1">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onView(t.id)}
              className={`block w-full rounded-md px-3 py-1.5 text-left text-sm ${
                view === t.id ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="border-t border-[var(--border)] p-2">
        <button
          type="button"
          onClick={() => onView("settings")}
          className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
            view === "settings" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          Налаштування
        </button>
      </div>
    </aside>
  );
}
