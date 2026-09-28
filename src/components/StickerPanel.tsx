"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getCategory, STICKER_VARIABLES } from "@/lib/categories";
import { activeVariant } from "@/lib/defaults";
import { buildStickerContext, fillTemplate, extractVariables } from "@/lib/sticker/fill";
import { downloadText } from "@/lib/export";
import type { ProductSpec } from "@/lib/types";
import { Badge, Button, CopyButton, Field, Modal, Section, TextArea, TextInput } from "./ui";

export function StickerPanel() {
  const products = useAppStore((s) => s.products);
  const activeId = useAppStore((s) => s.activeId);
  const categories = useAppStore((s) => s.categories);
  const settings = useAppStore((s) => s.settings);
  const updateCategory = useAppStore((s) => s.updateCategory);
  const setStickerText = useAppStore((s) => s.setStickerText);
  const setStickerData = useAppStore((s) => s.setStickerData);
  const updateVariant = useAppStore((s) => s.updateVariant);

  const product = products.find((p) => p.id === activeId) ?? null;
  const [showModal, setShowModal] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [local, setLocal] = useState("");

  const category = getCategory(categories, product?.category ?? "azu");
  const variant = product ? activeVariant(product) : null;

  const ctx = useMemo(() => {
    if (!product || !variant) return {};
    return buildStickerContext({
      product,
      spec: product.spec,
      category,
      variant,
      importerName: product.spec.importer.name,
      importerAddress: product.spec.importer.address,
      importerPhone: product.spec.importer.phone ?? "",
      manufacturerName: product.spec.manufacturer.name,
      manufacturerAddress: product.spec.manufacturer.address,
      manufacturerCountry: product.spec.manufacturer.country,
    });
  }, [product, variant, category]);

  const filled = useMemo(() => fillTemplate(category.stickerTemplate, ctx), [category.stickerTemplate, ctx]);

  useEffect(() => {
    if (product) setLocal(product.stickerText || filled.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, category.id]);

  if (!product || !variant) return <div className="p-6 text-sm text-slate-500">Оберіть товар.</div>;

  const templateVars = extractVariables(category.stickerTemplate);
  const unknownVars = templateVars.filter((v) => !STICKER_VARIABLES.some((x) => x.key === v));

  const regenerate = () => {
    setStickerText(product.id, filled.text);
    setLocal(filled.text);
  };

  const save = (value: string) => {
    setLocal(value);
    setStickerText(product.id, value);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => setShowModal(true)}>
          Заповнити дані
        </Button>
        <Button size="sm" variant="secondary" onClick={regenerate}>
          Оновити з шаблону
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setShowTemplate((v) => !v)}>
          {showTemplate ? "Сховати шаблон" : "Шаблон категорії"}
        </Button>
        <CopyButton text={local} />
        <Button size="sm" variant="ghost" onClick={() => downloadText(local, `${product.spec.model || "sticker"}.txt`)}>
          Завантажити .txt
        </Button>
        <span className="text-xs text-slate-400">Шаблон: {category.uk}</span>
      </div>

      {filled.missing.length ? (
        <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
          Не заповнено: {filled.missing.join(", ")}. Вони лишаться у тексті як {"{{...}}"} — їх видно червоним у шаблоні.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="field-label mb-1">Готовий стікер (можна редагувати)</p>
          <TextArea rows={22} value={local} onChange={save} />
        </div>
        <div>
          <p className="field-label mb-1">Шаблон категорії — змінні червоним</p>
          <div className="h-[520px] overflow-auto rounded-lg border border-[var(--border)] bg-white px-3 py-3 text-[13px] leading-relaxed whitespace-pre-wrap">
            {category.stickerTemplate.split(/(\{\{\s*[a-zA-Z0-9_]+\s*\}\})/g).map((part, i) =>
              /^\{\{/.test(part) ? (
                <span key={i} className="rounded bg-red-50 px-0.5 font-semibold text-red-600">
                  {part}
                </span>
              ) : (
                <span key={i} className="text-slate-700">
                  {part}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      <Section title="Доступні змінні шаблону">
        <div className="flex flex-wrap gap-1.5">
          {STICKER_VARIABLES.map((v) => (
            <Badge key={v.key} tone={templateVars.includes(v.key) ? "green" : "gray"}>
              {`{{${v.key}}}`}
            </Badge>
          ))}
        </div>
        {unknownVars.length ? (
          <p className="mt-2 text-xs text-red-600">Невідомі змінні: {unknownVars.join(", ")}</p>
        ) : null}
      </Section>

      {showTemplate ? (
        <Section title="Редактор шаблону категорії" subtitle="Зберігається у браузері та застосовується до всіх товарів цієї категорії">
          <TextArea
            rows={22}
            value={category.stickerTemplate}
            onChange={(v) => updateCategory(category.id, { stickerTemplate: v })}
          />
        </Section>
      ) : null}

      {showModal ? (
        <StickerModal
          onClose={() => setShowModal(false)}
          productId={product.id}
          spec={product.spec}
          overrides={product.stickerData}
          onChange={(key, value) => setStickerData(product.id, key, value)}
          variantColor={variant.color}
          variantEan={variant.ean13}
          onVariant={(patch) => updateVariant(product.id, variant.id, patch)}
          onApply={regenerate}
        />
      ) : null}
    </div>
  );
}

function StickerModal({
  onClose,
  spec,
  overrides,
  onChange,
  variantColor,
  variantEan,
  onVariant,
  onApply,
}: {
  onClose: () => void;
  productId: string;
  spec: ProductSpec;
  overrides: Record<string, string>;
  onChange: (key: string, value: string) => void;
  variantColor: string;
  variantEan: string;
  onVariant: (patch: { color?: string; ean13?: string }) => void;
  onApply: () => void;
}) {
  const val = (key: string, fallback: string) => overrides[key] ?? fallback;

  return (
    <Modal
      open
      wide
      title="Дані для стікера"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Закрити
          </Button>
          <Button
            onClick={() => {
              onApply();
              onClose();
            }}
          >
            Застосувати у стікер
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
          <Field label="Модель">
            <TextInput value={val("model", spec.model)} onChange={(v) => onChange("model", v)} />
          </Field>
          <Field label="Колір">
            <TextInput value={variantColor} onChange={(v) => onVariant({ color: v })} />
          </Field>
          <Field label="Матеріал, склад" className="col-span-2">
            <TextArea rows={2} value={val("material", spec.material)} onChange={(v) => onChange("material", v)} />
          </Field>
          <Field label="Розмір Д × Ш × В">
            <TextInput
              value={val("dimensions", `${spec.dimensions.length} × ${spec.dimensions.width} × ${spec.dimensions.height}`)}
              onChange={(v) => onChange("dimensions", v)}
            />
          </Field>
          <Field label="Вага, г">
            <TextInput value={val("weight", String(spec.weightG))} onChange={(v) => onChange("weight", v)} />
          </Field>
          <Field label="Характеристики (за категорією)" className="col-span-2">
            <TextArea value={val("characteristics", "")} onChange={(v) => onChange("characteristics", v)} placeholder="Опишіть характеристики" />
          </Field>
          <Field label="Виробник">
            <TextInput value={val("manufacturer", spec.manufacturer.name)} onChange={(v) => onChange("manufacturer", v)} />
          </Field>
          <Field label="Адреса виробника">
            <TextInput value={val("manufacturerAddress", spec.manufacturer.address)} onChange={(v) => onChange("manufacturerAddress", v)} />
          </Field>
          <Field label="Імпортер">
            <TextInput value={val("importer", spec.importer.name)} onChange={(v) => onChange("importer", v)} />
          </Field>
          <Field label="Адреса імпортера">
            <TextInput value={val("importerAddress", spec.importer.address)} onChange={(v) => onChange("importerAddress", v)} />
          </Field>
          <Field label="Телефон імпортера">
            <TextInput value={val("importerPhone", spec.importer.phone ?? "")} onChange={(v) => onChange("importerPhone", v)} />
          </Field>
          <Field label="Дата виробництва">
            <TextInput value={val("productionDate", spec.productionDate)} onChange={(v) => onChange("productionDate", v)} />
          </Field>
          <Field label="Партія / замовлення">
            <TextInput value={val("batch", spec.orderNumber)} onChange={(v) => onChange("batch", v)} />
          </Field>
          <Field label="Гарантія, міс.">
            <TextInput value={val("warrantyMonths", String(spec.warrantyMonths))} onChange={(v) => onChange("warrantyMonths", v)} />
          </Field>
          <Field label="Вологість зберігання">
            <TextInput value={val("storageHumidity", spec.storageHumidity)} onChange={(v) => onChange("storageHumidity", v)} />
          </Field>
          <Field label="Темп. мін. / макс.">
            <div className="grid grid-cols-2 gap-2">
              <TextInput value={val("tempMin", String(spec.storageTempMin))} onChange={(v) => onChange("tempMin", v)} />
              <TextInput value={val("tempMax", String(spec.storageTempMax))} onChange={(v) => onChange("tempMax", v)} />
            </div>
          </Field>
          <Field label="Строк служби" className="col-span-2">
            <TextInput value={val("serviceLife", spec.serviceLife)} onChange={(v) => onChange("serviceLife", v)} />
          </Field>
          <Field label="Утилізація" className="col-span-2">
            <TextInput value={val("disposal", "підлягає здачі в пункти збору для утилізації на спеціалізованих підприємствах")} onChange={(v) => onChange("disposal", v)} />
          </Field>
          <Field label="Комплектація" className="col-span-2">
            <TextInput value={val("contents", spec.packageContents.join(", "))} onChange={(v) => onChange("contents", v)} />
          </Field>
          <Field label="Технічні регламенти" className="col-span-2">
            <TextArea value={val("regulations", "")} onChange={(v) => onChange("regulations", v)} placeholder="ПКМУ №1077, №1097, №139…" />
          </Field>
          <Field label="Штрихкод EAN-13">
            <TextInput value={variantEan} onChange={(v) => onVariant({ ean13: v.replace(/[^\d]/g, "").slice(0, 13) })} />
          </Field>
      </div>
    </Modal>
  );
}
