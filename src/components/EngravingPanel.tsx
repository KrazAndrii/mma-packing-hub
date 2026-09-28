"use client";

import { useEffect, useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { getProfile } from "@/lib/profiles";
import { buildEngraving } from "@/lib/generate/engraving";
import { buildEngravingPlan } from "@/lib/generate/engravingPlan";
import { downloadText } from "@/lib/export";
import type { EngravingResult } from "@/lib/types";
import { Button, Select } from "./ui";

export function EngravingPanel() {
  const spec = useProjectStore((s) => s.spec);
  const profileId = useProjectStore((s) => s.profileId);
  const format = useProjectStore((s) => s.format);
  const setFormat = useProjectStore((s) => s.setFormat);
  const [result, setResult] = useState<EngravingResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const profile = getProfile(profileId);
  const plan = buildEngravingPlan(spec, profile, format);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    buildEngraving(spec, profile, { format })
      .then((r) => {
        if (!cancelled) setResult(r);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Помилка генерації");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [spec, profile, format]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="field-label">Режим:</span>
          <Select<"full" | "compact">
            value={format}
            onChange={setFormat}
            options={[
              { value: "full", label: "Повні пробіли (коробки, доки)" },
              { value: "compact", label: "Компактний (АЗУ, TWS)" },
            ]}
            className="!w-64"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={!result}
            onClick={() => result && downloadText(result.svg, `${spec.model || "engraving"}-${format}.svg`, "image/svg+xml")}
          >
            Завантажити SVG
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!result}
            onClick={() => result && downloadText(result.dxf, `${spec.model || "engraving"}-${format}.dxf`, "image/vnd.dxf")}
          >
            Завантажити DXF
          </Button>
        </div>
      </div>

      {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-500">
            Векторний макет {result ? `(${result.widthMm}×${result.heightMm} мм)` : ""}
          </p>
          <div className="svg-preview flex min-h-[300px] items-center justify-center rounded-lg border border-[var(--border)] bg-white p-4">
            {loading ? (
              <span className="text-sm text-slate-400">Генерація…</span>
            ) : result ? (
              <div dangerouslySetInnerHTML={{ __html: result.svg }} />
            ) : null}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-500">Порядок рядків (стандарт гравіювання)</p>
          <pre className="max-h-[300px] overflow-auto rounded-lg border border-[var(--border)] bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
            {plan.text}
          </pre>
        </div>
      </div>
    </div>
  );
}
