"use client";

import { useProjectStore } from "@/store/useProjectStore";
import { CATEGORY_META } from "@/lib/profiles";
import { LANGUAGES, LANGUAGE_PRESETS } from "@/lib/i18n/locales";
import type { Category, EngravingSection, Language, PortOutput, PortSpec } from "@/lib/types";
import { Button, Field, NumberInput, Section, Select, TextArea, TextInput } from "./ui";

const CATEGORY_OPTIONS = (Object.keys(CATEGORY_META) as Category[]).map((c) => ({
  value: c,
  label: CATEGORY_META[c].uk,
}));

const CERT_OPTIONS = ["CE", "RoHS", "RED", "WEEE", "BIN", "TREFOIL", "MOBIUS", "Qi", "Qi2", "EAC", "FCC", "CCC"];
const SECTION_OPTIONS: { value: string; label: string }[] = [
  { value: "1", label: "1. Основні характеристики" },
  { value: "2", label: "2. Вхідні параметри" },
  { value: "3", label: "3. Вихідні параметри" },
  { value: "4", label: "4. Стандарти/технології" },
  { value: "5", label: "5. Знаки" },
  { value: "6", label: "6. Країна" },
  { value: "7", label: "7. Партія" },
];

function serializeOutputs(outputs: PortOutput[]): string {
  return outputs.map((o) => `${o.volts}/${o.amps}`).join(", ");
}

function parseOutputs(text: string): PortOutput[] {
  return text
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [volts, amps] = chunk.split("/").map((s) => (s ?? "").trim());
      return { volts: volts || "", amps: amps || "" };
    });
}

export function SpecForm() {
  const spec = useProjectStore((s) => s.spec);
  const updateSpec = useProjectStore((s) => s.updateSpec);
  const updateInput = useProjectStore((s) => s.updateInput);
  const addPort = useProjectStore((s) => s.addPort);
  const updatePort = useProjectStore((s) => s.updatePort);
  const removePort = useProjectStore((s) => s.removePort);

  const toggleCert = (cert: string) => {
    const has = spec.certifications.includes(cert);
    updateSpec({
      certifications: has ? spec.certifications.filter((c) => c !== cert) : [...spec.certifications, cert],
    });
  };

  const toggleLang = (lang: Language) => {
    const has = spec.languages.includes(lang);
    const next = has ? spec.languages.filter((l) => l !== lang) : [...spec.languages, lang];
    updateSpec({ languages: next });
  };

  return (
    <div>
      <Section title="Загальне" subtitle="Модель, категорія, базові дані">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Категорія">
            <Select<Category>
              value={spec.category}
              onChange={(v) => {
                const meta = CATEGORY_META[v];
                updateSpec({
                  category: v,
                  wireless: meta.wireless,
                  productNameUk: spec.productNameUk || meta.uk,
                });
              }}
              options={CATEGORY_OPTIONS}
            />
          </Field>
          <Field label="Модель / артикул">
            <TextInput value={spec.model} onChange={(v) => updateSpec({ model: v })} placeholder="RD-FC20CLEBG" />
          </Field>
          <Field label="Назва з 1С" hint="Без загальних слів (кабель, навушники), з кольором">
            <TextInput value={spec.nameFrom1C} onChange={(v) => updateSpec({ nameFrom1C: v })} placeholder="RIDEA BASS LINE Black" />
          </Field>
          <Field label="Номер партії / замовлення">
            <TextInput value={spec.orderNumber} onChange={(v) => updateSpec({ orderNumber: v })} placeholder="0782" />
          </Field>
          <Field label="Назва товару (UA)">
            <TextInput value={spec.productNameUk} onChange={(v) => updateSpec({ productNameUk: v })} />
          </Field>
          <Field label="Колір">
            <TextInput value={spec.color} onChange={(v) => updateSpec({ color: v })} placeholder="чорний" />
          </Field>
          <Field label="Вага, г">
            <NumberInput value={spec.weightG} step={0.1} onChange={(v) => updateSpec({ weightG: v })} />
          </Field>
          <Field label="Розмір (Д × Ш × В), мм" className="col-span-2">
            <div className="grid grid-cols-3 gap-2">
              <NumberInput value={spec.dimensions.length} step={0.1} onChange={(v) => updateSpec({ dimensions: { ...spec.dimensions, length: v } })} />
              <NumberInput value={spec.dimensions.width} step={0.1} onChange={(v) => updateSpec({ dimensions: { ...spec.dimensions, width: v } })} />
              <NumberInput value={spec.dimensions.height} step={0.1} onChange={(v) => updateSpec({ dimensions: { ...spec.dimensions, height: v } })} />
            </div>
          </Field>
          <Field label="Загальна потужність, Вт" className="col-span-2">
            <NumberInput value={spec.totalOutputW} step={0.5} onChange={(v) => updateSpec({ totalOutputW: v })} />
          </Field>
          <Field label="Матеріал, склад" className="col-span-2">
            <TextArea value={spec.material} onChange={(v) => updateSpec({ material: v })} rows={2} />
          </Field>
          <Field label="Технології (через кому)" className="col-span-2" hint="Qi, Qi2.2, PPS, QC3.0 — рядок «Technologies»">
            <TextInput
              value={spec.technologies.join(", ")}
              onChange={(v) => updateSpec({ technologies: v.split(",").map((x) => x.trim()).filter(Boolean) })}
            />
          </Field>
        </div>
      </Section>

      <Section title="Вхід" subtitle="Параметри живлення">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Тип входу">
            <Select<"AC" | "DC">
              value={spec.input.kind}
              onChange={(v) => updateInput({ kind: v })}
              options={[
                { value: "DC", label: "DC (авто/адаптер)" },
                { value: "AC", label: "AC (мережа)" },
              ]}
            />
          </Field>
          <Field label="Напруга, В">
            <TextInput value={spec.input.voltage} onChange={(v) => updateInput({ voltage: v })} placeholder="12-24" />
          </Field>
          <Field label="Частота, Гц (AC)">
            <TextInput value={spec.input.frequency ?? ""} onChange={(v) => updateInput({ frequency: v })} placeholder="50/60" />
          </Field>
          <Field label="Струм, А">
            <TextInput value={spec.input.current ?? ""} onChange={(v) => updateInput({ current: v })} placeholder="0.3" />
          </Field>
          <Field label="Макс. потужність входу, Вт" className="col-span-2">
            <NumberInput value={spec.input.maxW ?? 0} step={0.5} onChange={(v) => updateInput({ maxW: v })} />
          </Field>
        </div>
      </Section>

      <Section
        title="Порти та вихід"
        subtitle="Вихід/вхід, протоколи, PPS"
        right={
          <Button size="sm" variant="secondary" onClick={addPort}>
            + Порт
          </Button>
        }
      >
        <div className="space-y-3">
          {spec.ports.length === 0 ? <p className="text-xs text-slate-400">Портів ще немає.</p> : null}
          {spec.ports.map((port) => (
            <PortEditor
              key={port.id}
              port={port}
              onChange={(patch) => updatePort(port.id, patch)}
              onRemove={() => removePort(port.id)}
            />
          ))}
        </div>
      </Section>

      <Section title="Особливі характеристики (винятки)" subtitle="Акумулятор, ККД, магніт, аудіо, дані">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ємність, mAh">
            <NumberInput
              value={spec.battery?.capacityMah ?? 0}
              onChange={(v) => updateSpec({ battery: { ...spec.battery, capacityMah: v } })}
            />
          </Field>
          <Field label="Напруга батареї, В">
            <NumberInput
              value={spec.battery?.voltage ?? 0}
              step={0.01}
              onChange={(v) => updateSpec({ battery: { ...spec.battery, voltage: v } })}
            />
          </Field>
          <Field label="Енергія, Wh">
            <NumberInput
              value={spec.battery?.wh ?? 0}
              step={0.1}
              onChange={(v) => updateSpec({ battery: { ...spec.battery, wh: v } })}
            />
          </Field>
          <Field label="ККД, % (павербанк)">
            <NumberInput
              value={spec.conversionRate ?? 0}
              onChange={(v) => updateSpec({ conversionRate: v })}
            />
          </Field>
          <Field label="Режим (заголовок)" hint="напр. Power Bank Mode">
            <TextInput value={spec.modeLabel ?? ""} onChange={(v) => updateSpec({ modeLabel: v })} />
          </Field>
          <Field label="Magnetic Pull Force">
            <TextInput value={spec.magneticForce ?? ""} onChange={(v) => updateSpec({ magneticForce: v })} />
          </Field>
          <Field label="Driver Size (TWS)">
            <TextInput value={spec.driverSize ?? ""} onChange={(v) => updateSpec({ driverSize: v })} />
          </Field>
          <Field label="Audio Codecs">
            <TextInput value={spec.audioCodecs ?? ""} onChange={(v) => updateSpec({ audioCodecs: v })} />
          </Field>
          <Field label="Data Transfer (кабель/хаб)" className="col-span-2">
            <TextInput value={spec.dataTransfer ?? ""} onChange={(v) => updateSpec({ dataTransfer: v })} placeholder="480 Mbps" />
          </Field>
          <label className="col-span-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={spec.wireless}
              onChange={(e) => updateSpec({ wireless: e.target.checked })}
            />
            Бездротовий пристрій (потрібен RED)
          </label>
        </div>
      </Section>

      <Section
        title="Додаткові рядки специфікації"
        subtitle="З прив'язкою до незмінного порядку блоків"
        right={
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              updateSpec({ extraSpecs: [...spec.extraSpecs, { label: "", value: "", section: 3 }] })
            }
          >
            + Рядок
          </Button>
        }
      >
        <div className="space-y-2">
          {spec.extraSpecs.map((extra, i) => (
            <div key={i} className="grid grid-cols-[150px_1fr_1fr_auto] items-center gap-2">
              <Select<string>
                value={String(extra.section)}
                onChange={(v) =>
                  updateSpec({
                    extraSpecs: spec.extraSpecs.map((e, idx) =>
                      idx === i ? { ...e, section: Number(v) as EngravingSection } : e,
                    ),
                  })
                }
                options={SECTION_OPTIONS}
              />
              <TextInput
                value={extra.label}
                onChange={(v) =>
                  updateSpec({ extraSpecs: spec.extraSpecs.map((e, idx) => (idx === i ? { ...e, label: v } : e)) })
                }
                placeholder="Label"
              />
              <TextInput
                value={extra.value}
                onChange={(v) =>
                  updateSpec({ extraSpecs: spec.extraSpecs.map((e, idx) => (idx === i ? { ...e, value: v } : e)) })
                }
                placeholder="value"
              />
              <Button
                size="sm"
                variant="danger"
                onClick={() => updateSpec({ extraSpecs: spec.extraSpecs.filter((_, idx) => idx !== i) })}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Знаки та сертифікати">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {CERT_OPTIONS.map((cert) => (
            <label key={cert} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={spec.certifications.includes(cert)} onChange={() => toggleCert(cert)} />
              {cert}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Компанії" subtitle="Виробник та імпортер">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Виробник" className="col-span-2">
            <TextInput value={spec.manufacturer.name} onChange={(v) => updateSpec({ manufacturer: { ...spec.manufacturer, name: v } })} />
          </Field>
          <Field label="Адреса виробника" className="col-span-2">
            <TextInput value={spec.manufacturer.address} onChange={(v) => updateSpec({ manufacturer: { ...spec.manufacturer, address: v } })} />
          </Field>
          <Field label="Країна виробника">
            <TextInput value={spec.manufacturer.country} onChange={(v) => updateSpec({ manufacturer: { ...spec.manufacturer, country: v } })} />
          </Field>
          <div />
          <Field label="Імпортер" className="col-span-2">
            <TextInput value={spec.importer.name} onChange={(v) => updateSpec({ importer: { ...spec.importer, name: v } })} />
          </Field>
          <Field label="Адреса імпортера" className="col-span-2">
            <TextInput value={spec.importer.address} onChange={(v) => updateSpec({ importer: { ...spec.importer, address: v } })} />
          </Field>
          <Field label="Телефон імпортера">
            <TextInput value={spec.importer.phone ?? ""} onChange={(v) => updateSpec({ importer: { ...spec.importer, phone: v } })} />
          </Field>
        </div>
      </Section>

      <Section title="Маркування, штрихкод і мови">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Дата виробництва">
            <TextInput type="date" value={spec.productionDate} onChange={(v) => updateSpec({ productionDate: v })} />
          </Field>
          <Field label="Гарантія, міс.">
            <NumberInput value={spec.warrantyMonths} onChange={(v) => updateSpec({ warrantyMonths: v })} />
          </Field>
          <Field label="Вологість зберігання">
            <TextInput value={spec.storageHumidity} onChange={(v) => updateSpec({ storageHumidity: v })} />
          </Field>
          <Field label="Темп. зберігання, °C">
            <div className="grid grid-cols-2 gap-2">
              <NumberInput value={spec.storageTempMin} onChange={(v) => updateSpec({ storageTempMin: v })} />
              <NumberInput value={spec.storageTempMax} onChange={(v) => updateSpec({ storageTempMax: v })} />
            </div>
          </Field>
          <Field label="Строк служби" className="col-span-2">
            <TextInput value={spec.serviceLife} onChange={(v) => updateSpec({ serviceLife: v })} />
          </Field>
          <Field label="Комплектація (через кому)" className="col-span-2">
            <TextArea
              value={spec.packageContents.join(", ")}
              onChange={(v) => updateSpec({ packageContents: v.split(",").map((x) => x.trim()).filter(Boolean) })}
              rows={2}
            />
          </Field>
          <Field label="Штрихкод EAN-13" className="col-span-2" hint="13 цифр, контрольна цифра перевіряється автоматично">
            <TextInput value={spec.ean13} onChange={(v) => updateSpec({ ean13: v.replace(/\D/g, "").slice(0, 13) })} placeholder="4820000000000" />
          </Field>
        </div>
        <div className="mt-3">
          <span className="field-label">Мови пакування ({spec.languages.length})</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {LANGUAGE_PRESETS.map((p) => (
              <Button key={p.id} size="sm" variant="secondary" onClick={() => updateSpec({ languages: p.languages })}>
                {p.label}
              </Button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {LANGUAGES.map((l) => (
              <label key={l.code} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={spec.languages.includes(l.code)} onChange={() => toggleLang(l.code)} />
                {l.flag} {l.code}
              </label>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

function PortEditor({
  port,
  onChange,
  onRemove,
}: {
  port: PortSpec;
  onChange: (patch: Partial<PortSpec>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-slate-50 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Тип">
          <TextInput value={port.type} onChange={(v) => onChange({ type: v })} placeholder="USB-C" />
        </Field>
        <Field label="Напрямок">
          <Select<"input" | "output">
            value={port.direction ?? "output"}
            onChange={(v) => onChange({ direction: v })}
            options={[
              { value: "output", label: "Вихід" },
              { value: "input", label: "Вхід" },
            ]}
          />
        </Field>
        <Field label="Вихід: V/A через кому">
          <TextInput value={serializeOutputs(port.outputs)} onChange={(v) => onChange({ outputs: parseOutputs(v) })} placeholder="5/3, 9/2.22, 12/1.67" />
        </Field>
        <Field label="PPS: V/A через кому">
          <TextInput
            value={serializeOutputs(port.ppsOutputs ?? [])}
            onChange={(v) => onChange({ ppsOutputs: parseOutputs(v) })}
            placeholder="3.3-5.9/3, 3.3-11/2"
          />
        </Field>
        <Field label="Протоколи (через кому)">
          <TextInput
            value={port.protocols.join(", ")}
            onChange={(v) => onChange({ protocols: v.split(",").map((x) => x.trim()).filter(Boolean) })}
            placeholder="PD3.0, QC3.0"
          />
        </Field>
        <Field label="Макс. потужність порту, Вт">
          <NumberInput value={port.maxW} step={0.5} onChange={(v) => onChange({ maxW: v })} />
        </Field>
        <Field label="Мітка (необов'язково)" className="col-span-2" hint="напр. USB-C Cable Output">
          <TextInput value={port.label ?? ""} onChange={(v) => onChange({ label: v })} />
        </Field>
      </div>
      <div className="mt-2 text-right">
        <Button size="sm" variant="danger" onClick={onRemove}>
          Видалити порт
        </Button>
      </div>
    </div>
  );
}
