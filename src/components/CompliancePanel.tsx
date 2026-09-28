"use client";

import { useMemo, useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { getProfile } from "@/lib/profiles";
import { runRules } from "@/lib/rules/engine";
import type { Rule } from "@/lib/rules/types";
import { Button, Card, Select, StatusDot, TextInput } from "./ui";

const SEVERITY_ORDER: Record<string, number> = { error: 0, warning: 1, info: 2 };

export function CompliancePanel() {
  const spec = useProjectStore((s) => s.spec);
  const profileId = useProjectStore((s) => s.profileId);
  const rules = useProjectStore((s) => s.rules);
  const updateRule = useProjectStore((s) => s.updateRule);
  const resetRules = useProjectStore((s) => s.resetRules);
  const [editing, setEditing] = useState(false);

  const profile = getProfile(profileId);
  const results = useMemo(() => runRules(spec, rules, profile), [spec, rules, profile]);

  const sorted = [...results].sort((a, b) => {
    if (a.passed !== b.passed) return a.passed ? 1 : -1;
    return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
  });

  const errors = results.filter((r) => !r.passed && r.severity === "error").length;
  const warnings = results.filter((r) => !r.passed && r.severity === "warning").length;

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <StatusDot severity={errors ? "error" : "ok"} />
            Помилки: <b>{errors}</b>
          </span>
          <span className="flex items-center gap-2">
            <StatusDot severity={warnings ? "warning" : "ok"} />
            Попередження: <b>{warnings}</b>
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setEditing((v) => !v)}>
            {editing ? "Готово" : "Редагувати правила"}
          </Button>
          <Button size="sm" variant="ghost" onClick={resetRules}>
            Скинути
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((r) => (
          <Card key={r.ruleId} className={`px-3 py-2 ${r.passed ? "opacity-70" : ""}`}>
            <div className="flex items-start gap-2">
              <StatusDot severity={r.passed ? "ok" : r.severity} />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{r.title}</p>
                {!r.passed ? <p className="text-xs text-slate-600">{r.message}</p> : null}
                {r.details?.length ? (
                  <ul className="mt-1 list-inside list-disc text-[11px] text-slate-500">
                    {r.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editing ? (
        <div className="space-y-2 border-t border-[var(--border)] pt-3">
          <p className="text-xs text-slate-500">Правила зберігаються у профілі бренду та застосовуються автоматично.</p>
          {rules.map((rule) => (
            <RuleEditor key={rule.id} rule={rule} onChange={(patch) => updateRule(rule.id, patch)} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RuleEditor({ rule, onChange }: { rule: Rule; onChange: (patch: Partial<Rule>) => void }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-slate-50 p-3">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={rule.enabled} onChange={(e) => onChange({ enabled: e.target.checked })} />
          <b>{rule.title}</b>
        </label>
        <Select<string>
          value={rule.severity}
          onChange={(v) => onChange({ severity: v as Rule["severity"] })}
          options={[
            { value: "error", label: "Помилка" },
            { value: "warning", label: "Попередження" },
            { value: "info", label: "Інфо" },
          ]}
          className="!w-36"
        />
        <span className="text-[11px] text-slate-400">{rule.type}</span>
      </div>
      <div className="mt-2">
        <TextInput value={rule.message} onChange={(message) => onChange({ message })} />
      </div>
      {rule.type === "required_certs" ? (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <TextInput
            value={rule.base.join(", ")}
            onChange={(v) => onChange({ base: v.split(",").map((x) => x.trim()).filter(Boolean) } as Partial<Rule>)}
          />
          <TextInput
            value={rule.ifWireless.join(", ")}
            onChange={(v) =>
              onChange({ ifWireless: v.split(",").map((x) => x.trim()).filter(Boolean) } as Partial<Rule>)
            }
          />
        </div>
      ) : null}
      {rule.type === "forbidden_chars" ? (
        <div className="mt-2">
          <TextInput
            value={rule.chars.join(" ")}
            onChange={(v) => onChange({ chars: v.split(/\s+/).filter(Boolean) } as Partial<Rule>)}
          />
        </div>
      ) : null}
      {rule.type === "sum_ports_equals_total" ? (
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={rule.strict} onChange={(e) => onChange({ strict: e.target.checked } as Partial<Rule>)} />
            Строга рівність (однопортові)
          </label>
          <label className="flex items-center gap-2">
            Допуск, Вт
            <input
              type="number"
              step={0.05}
              value={rule.toleranceW}
              onChange={(e) => onChange({ toleranceW: Number(e.target.value) } as Partial<Rule>)}
              className="w-20 rounded border border-[var(--border)] px-2 py-1"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
