"use client";

import { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { downloadText } from "@/lib/export";
import { Button, Card, Field, TextInput } from "./ui";

function capitalize(value: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function joinParts(parts: string[]): string {
  return parts.map((p) => p.trim()).filter(Boolean).join(" ");
}

export function FilesPanel() {
  const spec = useProjectStore((s) => s.spec);
  const updateSpec = useProjectStore((s) => s.updateSpec);
  const [copied, setCopied] = useState("");

  const baseName = spec.nameFrom1C || `${spec.brand} ${spec.model}`.trim();
  const color = capitalize(spec.color);
  const folderName = joinParts([baseName, color]);
  const tieName = joinParts(["Галстук", baseName, color]);

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("error");
    }
  };

  const isCableLike = spec.category === "cable" || spec.category === "tws";

  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Назва з 1С" hint="Без загальних слів (кабель, навушники)">
          <TextInput value={spec.nameFrom1C} onChange={(v) => updateSpec({ nameFrom1C: v })} placeholder="RIDEA BASS LINE" />
        </Field>
        <Field label="Колір">
          <TextInput value={spec.color} onChange={(v) => updateSpec({ color: v })} placeholder="Black" />
        </Field>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="field-label">Папка в Bitrix24</p>
            <p className="mt-1 font-mono text-sm text-slate-800">{folderName || "—"}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => copy(folderName, "folder")} disabled={!folderName}>
            {copied === "folder" ? "Скопійовано" : "Копіювати"}
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Шаблон: [Назва з 1С] + [Колір]. Приклад: RIDEA BASS LINE Black</p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="field-label">Інфо-флаг («Галстук»)</p>
            <p className="mt-1 font-mono text-sm text-slate-800">{tieName || "—"}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => copy(tieName, "tie")} disabled={!tieName}>
            {copied === "tie" ? "Скопійовано" : "Копіювати"}
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Шаблон: Галстук + [Назва з 1С] + [Колір]. Для кабелів і дротових навушників.
          {!isCableLike ? " Поточна категорія зазвичай не потребує «галстука»." : ""}
        </p>
      </Card>

      <Card className="p-4">
        <p className="text-xs text-slate-500">
          Порядок роботи: знайти товар у 1С за штрихкодом («Продажі» → «Номенклатура»), скопіювати назву без
          загальних слів, додати колір, перейменувати макет і завантажити у відповідну папку на диску.
        </p>
        <div className="mt-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              downloadText(`Папка: ${folderName}\nГалстук: ${tieName}\n`, `${spec.model || "files"}-naming.txt`)
            }
          >
            Завантажити назви .txt
          </Button>
        </div>
      </Card>
    </div>
  );
}
