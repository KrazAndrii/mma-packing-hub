import type { CategoryMeta, Product, ProductSpec, ProductVariant } from "../types";
import { markLabel, canonicalMark } from "../generate/engravingPlan";
import { trimNum } from "../generate/specs";

export const VARIABLE_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function extractVariables(template: string): string[] {
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  VARIABLE_RE.lastIndex = 0;
  while ((m = VARIABLE_RE.exec(template)) !== null) found.add(m[1]);
  return Array.from(found);
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

export interface StickerContextInput {
  product: Product;
  spec: ProductSpec;
  category: CategoryMeta;
  variant: ProductVariant;
  importerName: string;
  importerAddress: string;
  importerPhone: string;
  manufacturerName: string;
  manufacturerAddress: string;
  manufacturerCountry: string;
}

export function buildStickerContext(input: StickerContextInput): Record<string, string> {
  const { spec, category, variant } = input;
  const marks = spec.certifications
    .map(canonicalMark)
    .filter((m) => ["CE", "RoHS", "BIN", "TREFOIL", "MOBIUS", "QI", "QI2"].includes(m))
    .map((m) => `[${markLabel(m)}]`)
    .join(" ");

  const utp = (input.product.utpBadges ?? []).join(" | ");
  const power = spec.totalOutputW ? `${trimNum(spec.totalOutputW)}W` : "";
  const title = [spec.model || input.product.name, utp, power].filter(Boolean).join(" ").trim();

  const ctx: Record<string, string> = {
    title,
    model: spec.model || input.product.name,
    productName: spec.productNameUk || category.uk,
    utp,
    power,
    material: spec.material,
    color: variant.color || spec.color,
    length: String(spec.dimensions.length || ""),
    width: String(spec.dimensions.width || ""),
    height: String(spec.dimensions.height || ""),
    weight: String(spec.weightG || ""),
    characteristics: category.uk ? "" : "",
    manufacturer: input.manufacturerName,
    manufacturerAddress: input.manufacturerAddress,
    manufacturerCountry: input.manufacturerCountry,
    importer: input.importerName,
    importerAddress: input.importerAddress,
    importerPhone: input.importerPhone,
    productionDate: formatDate(spec.productionDate),
    batch: spec.orderNumber,
    warrantyMonths: String(spec.warrantyMonths || ""),
    storageHumidity: spec.storageHumidity,
    tempMin: String(spec.storageTempMin),
    tempMax: String(spec.storageTempMax),
    serviceLife: spec.serviceLife,
    disposal: "підлягає здачі в пункти збору для утилізації на спеціалізованих підприємствах",
    contents: spec.packageContents.join(", "),
    regulations: "",
    marks,
    ean13: variant.ean13 || spec.ean13,
  };

  for (const [k, v] of Object.entries(input.product.stickerData)) {
    if (v !== undefined && v !== null && String(v).length) ctx[k] = String(v);
  }
  return ctx;
}

export function fillTemplate(
  template: string,
  ctx: Record<string, string>,
): { text: string; variables: string[]; missing: string[] } {
  const variables = extractVariables(template);
  const missing = variables.filter((v) => !ctx[v] || !String(ctx[v]).trim());
  const text = template.replace(VARIABLE_RE, (_full, key: string) => {
    const value = ctx[key];
    return value && String(value).trim() ? String(value) : `{{${key}}}`;
  });
  return { text, variables, missing };
}
