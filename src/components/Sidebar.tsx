"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { PROFILES, getProfile } from "@/lib/profiles";
import { getCategory } from "@/lib/categories";
import { Select } from "./ui";

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

const ICONS: Record<string, string> = {
  data: "M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h5",
  engraving: "M3 21l6-2 11-11-4-4L5 15l-2 6z M14 4l6 6",
  specs: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
  translations: "M12 2a10 10 0 100 20 10 10 0 000-20z M2 12h20 M12 2c3 3 3 17 0 20 M12 2c-3 3-3 17 0 20",
  utp: "M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z",
  sticker: "M20 12l-8 8H4V4h8z M15 9h5v5",
  barcode: "M4 5v14 M7 5v14 M10 5v14 M14 5v14 M17 5v14 M20 5v14",
  check: "M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z M9 12l2 2 4-4",
  export: "M12 3v12 M7 10l5 5 5-5 M5 21h14",
  settings: "M12 9a3 3 0 100 6 3 3 0 000-6z M19 12a7 7 0 00-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 00-1.7-1L14.5 3h-5l-.4 2.6a7 7 0 00-1.7 1l-2.3-1-2 3.4L4.1 11a7 7 0 000 2l-2 1.5 2 3.4 2.3-1a7 7 0 001.7 1l.4 2.6h5l.4-2.6a7 7 0 001.7-1l2.3 1 2-3.4-2-1.5c.06-.33.1-.66.1-1z",
};

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${className}`}>
      {(ICONS[name] ?? ICONS.data).split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : `M${seg}`} />
      ))}
    </svg>
  );
}

const TOOLS: { id: View; label: string; icon: string }[] = [
  { id: "data", label: "Дані товару", icon: "data" },
  { id: "engraving", label: "Гравіювання", icon: "engraving" },
  { id: "specs", label: "Специфікації", icon: "specs" },
  { id: "translations", label: "Переклади", icon: "translations" },
  { id: "utp", label: "УТП", icon: "utp" },
  { id: "sticker", label: "Стікер", icon: "sticker" },
  { id: "barcode", label: "Штрихкод", icon: "barcode" },
  { id: "export", label: "Експорт", icon: "export" },
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
  const clearAll = useAppStore((s) => s.clearAll);
  const [query, setQuery] = useState("");

  const profile = getProfile(brandId);
  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${p.spec.model} ${p.name} ${p.spec.ean13}`.toLowerCase().includes(q);
  });

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-[var(--border)] bg-white">
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold text-white" style={{ background: profile.accent }}>
          MMA
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-[13px] font-bold leading-tight text-slate-900">Packing Hub</h1>
          <p className="truncate text-[10px] text-slate-500">Пакування та маркування</p>
        </div>
      </div>

      <div className="px-3 pb-2">
        <Select<string>
          value={brandId}
          onChange={setBrandId}
          options={PROFILES.map((p) => ({ value: p.id, label: p.name }))}
          className="!py-1 !text-xs"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Товари · {products.length}</span>
          <button
            type="button"
            onClick={addProduct}
            className="rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-medium text-white transition hover:bg-blue-700"
          >
            + Додати
          </button>
        </div>

        {products.length > 2 ? (
          <div className="px-3 pt-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Пошук…"
              className="w-full rounded-md border border-[var(--border)] bg-slate-50 px-2 py-1 text-xs outline-none focus:border-blue-400 focus:bg-white"
            />
          </div>
        ) : null}

        <div className="mt-2 min-h-0 flex-1 overflow-auto px-2 pb-1">
          {products.length === 0 ? (
            <p className="px-2 py-3 text-[11px] text-slate-400">Порожньо. Натисніть «Додати».</p>
          ) : null}
          {filtered.map((p) => {
            const isActive = p.id === activeId;
            const cat = getCategory(categories, p.category);
            return (
              <div
                key={p.id}
                onClick={() => setActive(p.id)}
                className={`group relative mb-0.5 cursor-pointer rounded-md px-2 py-1.5 transition ${
                  isActive ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`truncate text-[13px] font-medium ${isActive ? "text-blue-800" : "text-slate-700"}`}>
                    {p.spec.model || p.name || "Без моделі"}
                  </span>
                  <button
                    type="button"
                    title="Видалити"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Видалити «${p.spec.model || p.name || "товар"}»?`)) deleteProduct(p.id);
                    }}
                    className="hidden h-4 w-4 shrink-0 items-center justify-center rounded text-slate-400 transition hover:bg-red-50 hover:text-red-600 group-hover:flex"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full" style={{ background: profile.accent }} />
                  <span className="truncate text-[10px] text-slate-400">{cat.uk.replace(/\s*\(.*\)/, "")}</span>
                </div>
                {isActive ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateProduct(p.id);
                    }}
                    className="mt-0.5 text-[10px] text-slate-500 transition hover:text-blue-700"
                  >
                    Дублювати
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        <nav className="border-t border-[var(--border)] px-2 py-1.5">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onView(t.id)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition ${
                view === t.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon name={t.icon} />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="border-t border-[var(--border)] p-2">
        <button
          type="button"
          onClick={() => onView("settings")}
          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition ${
            view === "settings" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Icon name="settings" />
          Налаштування
        </button>
        <button
          type="button"
          onClick={() => {
            if (products.length && window.confirm("Очистити всі товари? Дію не можна скасувати (зробіть резервну копію в Налаштуваннях).")) {
              clearAll();
              onView("data");
            }
          }}
          className="mt-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-slate-400 transition hover:bg-red-50 hover:text-red-600"
        >
          Очистити все
        </button>
      </div>
    </aside>
  );
}
