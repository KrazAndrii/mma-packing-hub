"use client";

import { useProjectStore } from "@/store/useProjectStore";
import { buildSpecLines } from "@/lib/generate/specs";
import { specLinesToText } from "@/lib/i18n/translate";
import { downloadText } from "@/lib/export";
import { Button } from "./ui";

export function SpecsPanel() {
  const spec = useProjectStore((s) => s.spec);
  const lines = buildSpecLines(spec, "UA");
  const text = specLinesToText(lines);

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">Вичитані спеки (техвідділ, UA)</p>
        <Button size="sm" variant="secondary" onClick={() => downloadText(text, `${spec.model || "specs"}-ua.txt`)}>
          Завантажити .txt
        </Button>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-white p-4">
        <dl className="space-y-2 text-sm">
          {lines.length === 0 ? <p className="text-slate-400">Немає даних.</p> : null}
          {lines.map((l, i) => (
            <div key={i}>
              <dt className="font-medium text-slate-800">{l.label}</dt>
              {l.value ? <dd className="text-slate-600">{l.value}</dd> : null}
              {l.children?.length ? (
                <dd>
                  <ul className="mt-1 space-y-0.5 border-l-2 border-slate-200 pl-3 text-slate-600">
                    {l.children.map((c, j) => (
                      <li key={j} className="font-mono text-xs">
                        {c}
                      </li>
                    ))}
                  </ul>
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
