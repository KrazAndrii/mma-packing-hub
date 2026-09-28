"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { buildUtpBadges } from "@/lib/utp";
import { aiUtp } from "@/lib/ai/provider";
import { Badge, Button, CopyableText, Section, TextArea } from "./ui";

export function UtpPanel() {
  const products = useAppStore((s) => s.products);
  const activeId = useAppStore((s) => s.activeId);
  const settings = useAppStore((s) => s.settings);
  const setUtp = useAppStore((s) => s.setUtp);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const product = products.find((p) => p.id === activeId) ?? null;
  const auto = product ? buildUtpBadges(product.spec) : [];

  useEffect(() => setNote(""), [activeId]);

  if (!product) return <div className="p-6 text-sm text-slate-500">Оберіть товар.</div>;

  const badges = product.utpBadges.length ? product.utpBadges : auto;

  const runAi = async () => {
    setBusy(true);
    setNote("");
    const res = await aiUtp(product.spec, settings.aiApiKey, settings.aiModel);
    setBusy(false);
    if (res.ok && Array.isArray(res.data)) {
      setUtp(product.id, res.data as string[]);
      setNote("ШІ оновив значки.");
    } else {
      setNote(res.error ?? "Не вдалося отримати відповідь ШІ.");
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Section
        title="УТП — англійські значки для пакування"
        subtitle="Короткі переваги (до 3 слів), які ставляться як значки на коробці"
        right={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setUtp(product.id, auto)}>
              Згенерувати
            </Button>
            {settings.aiApiKey ? (
              <Button size="sm" onClick={runAi} disabled={busy}>
                {busy ? "…" : "Покращити ШІ"}
              </Button>
            ) : null}
          </div>
        }
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {badges.map((b, i) => (
            <Badge key={i} tone="blue">
              {b}
            </Badge>
          ))}
        </div>
        <TextArea
          rows={5}
          value={badges.join("\n")}
          onChange={(v) => setUtp(product.id, v.split("\n").map((x) => x.trim()).filter(Boolean))}
        />
        {note ? <p className="mt-2 text-xs text-slate-600">{note}</p> : null}
      </Section>

      <CopyableText title="Значки УТП (для копіювання)" text={badges.join("\n")} rows={6} />
    </div>
  );
}
