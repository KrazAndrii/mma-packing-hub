"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getCategory } from "@/lib/categories";
import { LANGUAGES, LANGUAGE_PRESETS } from "@/lib/i18n/locales";
import { parseSpecText, type ParseOutput } from "@/lib/parse/specParser";
import { aiParseSpec } from "@/lib/ai/provider";
import type { Language, PortOutput, PortSpec, ProductSpec } from "@/lib/types";
import { Badge, Button, CopyableText, Field, NumberInput, Section, Select, TextArea, TextInput } from "./ui";

function ListField({
  value,
  onChange,
  placeholder,
  hint,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [raw, setRaw] = useState(value.join(", "));
  useEffect(() => {
    setRaw(value.join(", "));
  }, [value]);
  return (
    <TextInput
      value={raw}
      placeholder={placeholder}
      onChange={(v) => {
        setRaw(v);
        onChange(v.split(",").map((x) => x.trim()).filter(Boolean));
      }}
    />
  );
}

function ConfidenceBadge({ level }: { level: "high" | "medium" | "low" }) {
  if (level === "high") return <Badge tone="green">точно</Badge>;
  if (level === "medium") return <Badge tone="amber">перевірте</Badge>;
  return <Badge tone="red">впевненість низька</Badge>;
}

function outputText(outputs: PortOutput[]): string {
  return outputs.map((o) => `${o.volts}/${o.amps}`).join(", ");
}
function parseOutputText(text: string): PortOutput[] {
  return text
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => {
      const [volts, amps] = c.split("/").map((s) => (s ?? "").trim());
      return { volts: volts || "", amps: amps || "" };
    });
}

export function ProductDataPanel() {
  const products = useAppStore((s) => s.products);
  const activeId = useAppStore((s) => s.activeId);
  const categories = useAppStore((s) => s.categories);
  const settings = useAppStore((s) => s.settings);
  const updateSpec = useAppStore((s) => s.updateSpec);
  const updateProduct = useAppStore((s) => s.updateProduct);
  const applyParse = useAppStore((s) => s.applyParse);
  const updateVariant = useAppStore((s) => s.updateVariant);
  const addVariant = useAppStore((s) => s.addVariant);
  const removeVariant = useAppStore((s) => s.removeVariant);
  const setActiveVariant = useAppStore((s) => s.setActiveVariant);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const [parseResult, setParseResult] = useState<ParseOutput | null>(null);
  const [aiNote, setAiNote] = useState("");
  const [busy, setBusy] = useState(false);

  const product = products.find((p) => p.id === activeId) ?? null;
  const spec = product?.spec;
  const category = getCategory(categories, product?.category ?? "azu");

  useEffect(() => {
    setParseResult(null);
    setAiNote("");
  }, [activeId]);

  if (!product || !spec) {
    return <div className="p-6 text-sm text-slate-500">Оберіть або створіть товар у лівому меню.</div>;
  }

  const runParse = () => {
    setParseResult(parseSpecText(product.rawSpec));
    setAiNote("");
  };

  const apply = () => {
    if (!parseResult) return;
    applyParse(product.id, parseResult.patch, parseResult.detectedCategory);
    setParseResult(null);
  };

  const runAi = async () => {
    setBusy(true);
    setAiNote("");
    const res = await aiParseSpec(product.rawSpec, settings.aiApiKey, settings.aiModel);
    setBusy(false);
    if (res.ok && res.data) {
      applyParse(product.id, res.data as Partial<ProductSpec>);
      setAiNote("ШІ уточнив дані та застосував їх.");
    } else {
      setAiNote(res.error ?? "Не вдалося отримати відповідь ШІ.");
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Section
        title="Сирі специфікації від фабрики"
        subtitle="Вставте текст як є — система розбере його сама"
        right={
          <div className="flex gap-2">
            <Button size="sm" onClick={runParse} disabled={!product.rawSpec.trim()}>
              Розібрати
            </Button>
            {settings.aiApiKey ? (
              <Button size="sm" variant="secondary" onClick={runAi} disabled={busy}>
                {busy ? "…" : "Уточнити ШІ"}
              </Button>
            ) : null}
          </div>
        }
      >
        <TextArea
          rows={10}
          value={product.rawSpec}
          onChange={(v) => updateProduct(product.id, { rawSpec: v })}
          placeholder={"Model: RD-FC20CLEBG\nInput: DC 12-24V\nUSB-C Output: 5V/3A, 9V/2.22A (20W Max)\nBattery Capacity: 10000mAh 3.85V / 38.5Wh"}
        />
        {aiNote ? <p className="mt-2 text-xs text-slate-600">{aiNote}</p> : null}
      </Section>

      {parseResult ? (
        <Section
          title="Результат розбору"
          subtitle="Позначте, що перенести. Позначки показують, наскільки впевнено розпізнано поле."
          right={
            <div className="flex gap-2">
              <Button size="sm" onClick={apply}>
                Застосувати
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setParseResult(null)}>
                Скасувати
              </Button>
            </div>
          }
        >
          {parseResult.detectedCategory ? (
            <p className="mb-2 text-sm">
              Визначена категорія: <b>{getCategory(categories, parseResult.detectedCategory).uk}</b>{" "}
              <span className="text-xs text-slate-400">(змініть нижче за потреби)</span>
            </p>
          ) : null}
          {parseResult.warnings.length ? (
            <div className="mb-3 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
              {parseResult.warnings.map((w, i) => (
                <p key={i}>• {w}</p>
              ))}
            </div>
          ) : null}
          <div className="mb-3 space-y-1">
            {parseResult.recognized.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <ConfidenceBadge level={r.confidence} />
                <span className="font-medium text-slate-700">{r.label || r.key}</span>
                <span className="text-slate-500">{r.value}</span>
              </div>
            ))}
          </div>
          {parseResult.unknownLines.length ? (
            <CopyableText
              title={`Нерозпізнані рядки (${parseResult.unknownLines.length}) — збережуться як додаткові`}
              text={parseResult.unknownLines.join("\n")}
              rows={5}
            />
          ) : null}
        </Section>
      ) : null}

      <Section title="Загальна інформація" subtitle="Вноситься вручну">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Категорія">
            <Select<string>
              value={product.category}
              onChange={(v) => {
                const meta = getCategory(categories, v);
                updateProduct(product.id, { category: v });
                updateSpec(product.id, {
                  category: v,
                  wireless: meta.wireless,
                  certifications: Array.from(new Set([...spec.certifications, ...meta.defaultCerts])),
                });
              }}
              options={categories.map((c) => ({ value: c.id, label: c.uk }))}
            />
          </Field>
          <Field label="Модель / артикул" hint="Назва товару в списку береться звідси">
            <TextInput
              value={spec.model}
              onChange={(v) => {
                updateSpec(product.id, { model: v });
                updateProduct(product.id, { name: v });
              }}
            />
          </Field>
          <Field label="Назва з 1С">
            <TextInput value={spec.nameFrom1C} onChange={(v) => updateSpec(product.id, { nameFrom1C: v })} />
          </Field>
          <Field label="Номер партії / замовлення">
            <TextInput value={spec.orderNumber} onChange={(v) => updateSpec(product.id, { orderNumber: v })} />
          </Field>
          <Field label="Назва товару (UA)" className="col-span-2">
            <TextInput value={spec.productNameUk} onChange={(v) => updateSpec(product.id, { productNameUk: v })} />
          </Field>
          <Field label="Матеріал, склад" className="col-span-2">
            <TextArea rows={2} value={spec.material} onChange={(v) => updateSpec(product.id, { material: v })} />
          </Field>
          <Field label="Розмір (Д × Ш × В), мм" className="col-span-2">
            <div className="grid grid-cols-3 gap-2">
              <NumberInput step={0.1} value={spec.dimensions.length} onChange={(v) => updateSpec(product.id, { dimensions: { ...spec.dimensions, length: v } })} />
              <NumberInput step={0.1} value={spec.dimensions.width} onChange={(v) => updateSpec(product.id, { dimensions: { ...spec.dimensions, width: v } })} />
              <NumberInput step={0.1} value={spec.dimensions.height} onChange={(v) => updateSpec(product.id, { dimensions: { ...spec.dimensions, height: v } })} />
            </div>
          </Field>
          <Field label="Вага, г">
            <NumberInput step={0.1} value={spec.weightG} onChange={(v) => updateSpec(product.id, { weightG: v })} />
          </Field>
          <Field label="Загальна потужність, Вт">
            <NumberInput step={0.5} value={spec.totalOutputW} onChange={(v) => updateSpec(product.id, { totalOutputW: v })} />
          </Field>
          <Field label="Технології (через кому)" className="col-span-2" hint="Наприклад: Qi2.2, PD 3.0, QC 3.0">
            <ListField value={spec.technologies} onChange={(v) => updateSpec(product.id, { technologies: v })} placeholder="Qi2.2, PPS" />
          </Field>
          <Field label="Комплектація (через кому)" className="col-span-2">
            <ListField value={spec.packageContents} onChange={(v) => updateSpec(product.id, { packageContents: v })} />
          </Field>
        </div>
      </Section>

      <Section title="Характеристики за категорією" subtitle="Акумулятор, магніти, аудіо, дані">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ємність, mAh">
            <NumberInput value={spec.battery?.capacityMah ?? 0} onChange={(v) => updateSpec(product.id, { battery: { ...spec.battery, capacityMah: v } })} />
          </Field>
          <Field label="Напруга батареї, В">
            <NumberInput step={0.01} value={spec.battery?.voltage ?? 0} onChange={(v) => updateSpec(product.id, { battery: { ...spec.battery, voltage: v } })} />
          </Field>
          <Field label="Енергія, Wh">
            <NumberInput step={0.1} value={spec.battery?.wh ?? 0} onChange={(v) => updateSpec(product.id, { battery: { ...spec.battery, wh: v } })} />
          </Field>
          <Field label="ККД, %">
            <NumberInput value={spec.conversionRate ?? 0} onChange={(v) => updateSpec(product.id, { conversionRate: v })} />
          </Field>
          <Field label="Магніти">
            <TextInput value={spec.magneticForce ?? ""} onChange={(v) => updateSpec(product.id, { magneticForce: v })} placeholder="N52" />
          </Field>
          <Field label="Динаміки (driver)">
            <TextInput value={spec.driverSize ?? ""} onChange={(v) => updateSpec(product.id, { driverSize: v })} placeholder="13mm" />
          </Field>
          <Field label="Аудіокодеки">
            <TextInput value={spec.audioCodecs ?? ""} onChange={(v) => updateSpec(product.id, { audioCodecs: v })} placeholder="SBC, AAC" />
          </Field>
          <Field label="Передача даних">
            <TextInput value={spec.dataTransfer ?? ""} onChange={(v) => updateSpec(product.id, { dataTransfer: v })} placeholder="480 Mbps" />
          </Field>
        </div>
      </Section>

      <Section title="Порти" subtitle="Вхід та вихід" right={<Button size="sm" variant="secondary" onClick={() => updateSpec(product.id, { ports: [...spec.ports, { id: `p-${Date.now()}`, type: "USB-C", protocols: [], direction: "output", outputs: [{ volts: "5", amps: "3" }], maxW: 0 }] })}>+ Порт</Button>}>
        <div className="space-y-3">
          {spec.ports.map((port: PortSpec) => (
            <div key={port.id} className="rounded-lg border border-[var(--border)] bg-slate-50 p-3">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Тип">
                  <TextInput value={port.type} onChange={(v) => updateSpec(product.id, { ports: spec.ports.map((p) => (p.id === port.id ? { ...p, type: v } : p)) })} />
                </Field>
                <Field label="Напрямок">
                  <Select<"input" | "output">
                    value={port.direction ?? "output"}
                    onChange={(v) => updateSpec(product.id, { ports: spec.ports.map((p) => (p.id === port.id ? { ...p, direction: v } : p)) })}
                    options={[
                      { value: "output", label: "Вихід" },
                      { value: "input", label: "Вхід" },
                    ]}
                  />
                </Field>
                <Field label="Вихід: V/A через кому">
                  <TextInput
                    value={outputText(port.outputs)}
                    onChange={(v) => updateSpec(product.id, { ports: spec.ports.map((p) => (p.id === port.id ? { ...p, outputs: parseOutputText(v) } : p)) })}
                    placeholder="5/3, 9/2.22"
                  />
                </Field>
                <Field label="Макс. потужність порту, Вт">
                  <NumberInput step={0.5} value={port.maxW} onChange={(v) => updateSpec(product.id, { ports: spec.ports.map((p) => (p.id === port.id ? { ...p, maxW: v } : p)) })} />
                </Field>
                <Field label="Протоколи (через кому)" className="col-span-2">
                  <ListField value={port.protocols} onChange={(v) => updateSpec(product.id, { ports: spec.ports.map((p) => (p.id === port.id ? { ...p, protocols: v } : p)) })} placeholder="PD 3.0, QC 3.0" />
                </Field>
              </div>
              <div className="mt-2 text-right">
                <Button size="sm" variant="danger" onClick={() => updateSpec(product.id, { ports: spec.ports.filter((p) => p.id !== port.id) })}>
                  Видалити порт
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Варіанти кольорів" subtitle="Один товар може мати кілька кольорів/штрихкодів" right={<Button size="sm" variant="secondary" onClick={() => addVariant(product.id)}>+ Варіант</Button>}>
        <div className="space-y-2">
          {product.variants.map((v) => (
            <div key={v.id} className={`grid grid-cols-[auto_1fr_1fr_1fr_auto] items-end gap-2 rounded-lg border p-2 ${product.activeVariantId === v.id ? "border-blue-300 bg-blue-50" : "border-[var(--border)]"}`}>
              <label className="flex items-center gap-1 pb-2 text-xs text-slate-600">
                <input type="radio" checked={product.activeVariantId === v.id} onChange={() => setActiveVariant(product.id, v.id)} />
                активний
              </label>
              <Field label="Колір">
                <TextInput value={v.color} onChange={(x) => updateVariant(product.id, v.id, { color: x })} />
              </Field>
              <Field label="Штрихкод EAN-13">
                <TextInput value={v.ean13} onChange={(x) => updateVariant(product.id, v.id, { ean13: x.replace(/[^\d]/g, "").slice(0, 13) })} />
              </Field>
              <Field label="Уточнення назви">
                <TextInput value={v.nameSuffix} onChange={(x) => updateVariant(product.id, v.id, { nameSuffix: x })} />
              </Field>
              <div className="pb-2">
                <Button size="sm" variant="danger" onClick={() => removeVariant(product.id, v.id)} disabled={product.variants.length <= 1}>
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Мови перекладів">
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_PRESETS.map((p) => (
            <Button key={p.id} size="sm" variant="secondary" onClick={() => updateSettings({ languages: p.languages })}>
              {p.label}
            </Button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {LANGUAGES.map((l) => (
            <label key={l.code} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={settings.languages.includes(l.code as Language)}
                onChange={() =>
                  updateSettings({
                    languages: settings.languages.includes(l.code as Language)
                      ? settings.languages.filter((x) => x !== l.code)
                      : [...settings.languages, l.code as Language],
                  })
                }
              />
              {l.flag} {l.code}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Знаки та сертифікати">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {["CE", "RoHS", "WEEE", "BIN", "TREFOIL", "MOBIUS", "Qi", "Qi2", "RED", "EAC", "FCC"].map((cert) => (
            <label key={cert} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={spec.certifications.includes(cert)}
                onChange={() =>
                  updateSpec(product.id, {
                    certifications: spec.certifications.includes(cert)
                      ? spec.certifications.filter((c) => c !== cert)
                      : [...spec.certifications, cert],
                  })
                }
              />
              {cert}
            </label>
          ))}
        </div>
      </Section>
    </div>
  );
}
