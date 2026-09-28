"use client";

import { useEffect, useMemo, useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { PROFILES, getProfile } from "@/lib/profiles";
import { runRules } from "@/lib/rules/engine";
import { CATEGORY_META } from "@/lib/profiles";
import { SpecForm } from "@/components/SpecForm";
import { CompliancePanel } from "@/components/CompliancePanel";
import { EngravingPanel } from "@/components/EngravingPanel";
import { SpecsPanel } from "@/components/SpecsPanel";
import { StickerPanel } from "@/components/StickerPanel";
import { BarcodePanel } from "@/components/BarcodePanel";
import { TranslationsPanel } from "@/components/TranslationsPanel";
import { ExportPanel } from "@/components/ExportPanel";
import { Button, Card, Select, StatusDot, Tabs } from "@/components/ui";

type Tab = "engraving" | "specs" | "sticker" | "barcode" | "translations" | "compliance" | "export";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("engraving");

  const profileId = useProjectStore((s) => s.profileId);
  const spec = useProjectStore((s) => s.spec);
  const rules = useProjectStore((s) => s.rules);
  const setProfile = useProjectStore((s) => s.setProfile);
  const loadSample = useProjectStore((s) => s.loadSample);
  const newProduct = useProjectStore((s) => s.newProduct);

  useEffect(() => setMounted(true), []);

  const results = useMemo(() => runRules(spec, rules), [spec, rules]);
  const errors = results.filter((r) => !r.passed && r.severity === "error").length;
  const warnings = results.filter((r) => !r.passed && r.severity === "warning").length;

  const profile = getProfile(profileId);

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Завантаження MMA Packing Hub…
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1500px] p-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: profile.accent }}
          >
            MMA
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900">MMA Packing Hub</h1>
            <p className="text-xs text-slate-500">
              Гравіювання · специфікації · маркування · штрихкоди — автоматично зі специфікацій фабрики
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div style={{ minWidth: 160 }}>
            <Select<string>
              value={profileId}
              onChange={setProfile}
              options={PROFILES.map((p) => ({ value: p.id, label: `Бренд: ${p.name}` }))}
            />
          </div>
          <Button size="sm" variant="secondary" onClick={loadSample} disabled={profile.samples.length === 0}>
            Приклад
          </Button>
          <Button size="sm" variant="secondary" onClick={newProduct}>
            Новий товар
          </Button>
        </div>
      </header>

      <div className="mb-3 flex flex-wrap items-center gap-4 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-xs text-slate-600">
        <span className="flex items-center gap-2">
          <StatusDot severity={errors ? "error" : "ok"} />
          Комплаєнс: <b>{errors}</b> помилок, <b>{warnings}</b> попереджень
        </span>
        <span>
          {spec.brand} · {CATEGORY_META[spec.category].uk} · {spec.model || "без моделі"} ·{" "}
          {spec.languages.length} мов
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[440px_1fr]">
        <Card className="max-h-[calc(100vh-160px)] overflow-auto">
          <SpecForm />
        </Card>

        <Card className="max-h-[calc(100vh-160px)] overflow-auto">
          <Tabs<Tab>
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "engraving", label: "Гравіювання" },
              { value: "specs", label: "Спеки" },
              { value: "sticker", label: "Стікер (КМ)" },
              { value: "barcode", label: "Штрихкод" },
              { value: "translations", label: "Переклади" },
              { value: "compliance", label: "Комплаєнс", badge: errors || undefined },
              { value: "export", label: "Експорт" },
            ]}
          />
          {tab === "engraving" ? <EngravingPanel /> : null}
          {tab === "specs" ? <SpecsPanel /> : null}
          {tab === "sticker" ? <StickerPanel /> : null}
          {tab === "barcode" ? <BarcodePanel /> : null}
          {tab === "translations" ? <TranslationsPanel /> : null}
          {tab === "compliance" ? <CompliancePanel /> : null}
          {tab === "export" ? <ExportPanel /> : null}
        </Card>
      </div>
    </main>
  );
}
