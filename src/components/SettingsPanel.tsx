"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { downloadText } from "@/lib/export";
import { STICKER_VARIABLES } from "@/lib/categories";
import { Badge, Button, Field, Section, Select, TextArea, TextInput } from "./ui";

export function SettingsPanel() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const rules = useAppStore((s) => s.rules);
  const updateRule = useAppStore((s) => s.updateRule);
  const resetRules = useAppStore((s) => s.resetRules);
  const categories = useAppStore((s) => s.categories);
  const addCategory = useAppStore((s) => s.addCategory);
  const updateCategory = useAppStore((s) => s.updateCategory);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const backup = () => {
    const state = useAppStore.getState();
    downloadText(
      JSON.stringify({ products: state.products, categories: state.categories, settings: state.settings, rules: state.rules }, null, 2),
      "mma-packing-hub-backup.json",
      "application/json",
    );
  };

  const restore = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        useAppStore.setState({
          products: data.products ?? [],
          categories: data.categories ?? categories,
          settings: data.settings ?? settings,
          rules: data.rules ?? rules,
        });
      } catch {
        // ignore invalid file
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 p-4">
      <Section title="Компанії за замовчуванням" subtitle="Підставляються у нові товари та у стікер">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Імпортер" className="col-span-2">
            <TextInput value={settings.importer.name} onChange={(v) => updateSettings({ importer: { ...settings.importer, name: v } })} />
          </Field>
          <Field label="Адреса імпортера" className="col-span-2">
            <TextInput value={settings.importer.address} onChange={(v) => updateSettings({ importer: { ...settings.importer, address: v } })} />
          </Field>
          <Field label="Телефон імпортера">
            <TextInput value={settings.importer.phone ?? ""} onChange={(v) => updateSettings({ importer: { ...settings.importer, phone: v } })} />
          </Field>
          <Field label="Країна імпортера">
            <TextInput value={settings.importer.country} onChange={(v) => updateSettings({ importer: { ...settings.importer, country: v } })} />
          </Field>
          <Field label="Виробник" className="col-span-2">
            <TextInput value={settings.manufacturer.name} onChange={(v) => updateSettings({ manufacturer: { ...settings.manufacturer, name: v } })} />
          </Field>
          <Field label="Адреса виробника" className="col-span-2">
            <TextInput value={settings.manufacturer.address} onChange={(v) => updateSettings({ manufacturer: { ...settings.manufacturer, address: v } })} />
          </Field>
        </div>
      </Section>

      <Section title="Гравіювання">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Режим пробілів">
            <Select<"full" | "compact">
              value={settings.engravingFormat}
              onChange={(v) => updateSettings({ engravingFormat: v })}
              options={[
                { value: "full", label: "Повні пробіли (коробки)" },
                { value: "compact", label: "Компактний (АЗУ, TWS)" },
              ]}
            />
          </Field>
          <Field label="Формат рядків портів">
            <Select<"prefix" | "suffix">
              value={settings.portLineStyle}
              onChange={(v) => updateSettings({ portLineStyle: v })}
              options={[
                { value: "prefix", label: "Output USB-C (регламент)" },
                { value: "suffix", label: "USB-C Output (таблиця)" },
              ]}
            />
          </Field>
        </div>
      </Section>

      <Section title="ШІ (необов'язково)">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ключ Google AI Studio" hint="Безкоштовно на aistudio.google.com/apikey. Зберігається у браузері.">
            <TextInput type="password" value={settings.aiApiKey} onChange={(v) => updateSettings({ aiApiKey: v })} />
          </Field>
          <Field label="Модель">
            <TextInput value={settings.aiModel} onChange={(v) => updateSettings({ aiModel: v })} />
          </Field>
        </div>
      </Section>

      <Section title="Правила перевірки" subtitle="Можна вимкнути або змінити важливість" right={<Button size="sm" variant="ghost" onClick={resetRules}>Скинути</Button>}>
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-3 rounded border border-[var(--border)] px-3 py-2">
              <label className="flex flex-1 items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={rule.enabled} onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })} />
                {rule.title}
              </label>
              <Select<string>
                value={rule.severity}
                onChange={(v) => updateRule(rule.id, { severity: v as "error" | "warning" | "info" })}
                options={[
                  { value: "error", label: "Помилка" },
                  { value: "warning", label: "Увага" },
                  { value: "info", label: "Інфо" },
                ]}
                className="!w-32"
              />
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Категорії та шаблони стікерів"
        subtitle="Шаблон редагується вільно; змінні у подвійних дужках підставляються автоматично"
        right={<Button size="sm" variant="secondary" onClick={() => addCategory({ id: `cat_${Date.now()}`, uk: "Нова категорія", en: "New category", defaultCerts: ["CE", "RoHS"], wireless: false, stickerTemplate: "{{title}}\n\n{{characteristics}}" })}>+ Категорія</Button>}
      >
        <div className="space-y-2">
          {categories.map((c) => (
            <div key={c.id} className="rounded border border-[var(--border)]">
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                onClick={() => setOpenCat(openCat === c.id ? null : c.id)}
              >
                <span className="font-medium text-slate-800">{c.uk}</span>
                <span className="text-[11px] text-slate-400">{c.defaultCerts.join(", ")}</span>
              </button>
              {openCat === c.id ? (
                <div className="border-t border-[var(--border)] p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Назва (UA)">
                      <TextInput value={c.uk} onChange={(v) => updateCategory(c.id, { uk: v })} />
                    </Field>
                    <Field label="Назва (EN)">
                      <TextInput value={c.en} onChange={(v) => updateCategory(c.id, { en: v })} />
                    </Field>
                    <Field label="Сертифікати (через кому)">
                      <TextInput
                        value={c.defaultCerts.join(", ")}
                        onChange={(v) => updateCategory(c.id, { defaultCerts: v.split(",").map((x) => x.trim()).filter(Boolean) })}
                      />
                    </Field>
                    <label className="flex items-end gap-2 pb-2 text-sm text-slate-700">
                      <input type="checkbox" checked={c.wireless} onChange={(e) => updateCategory(c.id, { wireless: e.target.checked })} />
                      Бездротовий (потрібен RED)
                    </label>
                  </div>
                  <div className="mt-3">
                    <span className="field-label">Шаблон стікера</span>
                    <TextArea rows={18} value={c.stickerTemplate} onChange={(v) => updateCategory(c.id, { stickerTemplate: v })} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {STICKER_VARIABLES.map((v) => (
                      <Badge key={v.key}>{`{{${v.key}}}`}</Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Резервна копія">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={backup}>
            Завантажити копію
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Відновити з файлу
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) restore(file);
            }}
          />
        </div>
      </Section>
    </div>
  );
}
