import type { AppSettings, CategoryMeta, Product, ProductSpec, ProductVariant } from "./types";
import type { BrandProfile } from "./profiles";

let counter = 0;
export function newId(prefix = "id"): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

export function blankSpec(profile: BrandProfile, category: CategoryMeta, settings: AppSettings): ProductSpec {
  return {
    brand: profile.name,
    category: category.id,
    model: "",
    nameFrom1C: "",
    orderNumber: "",
    productNameUk: category.uk,
    color: "",
    material: "кольорові метали, алюміній, полімери та електронні компоненти",
    dimensions: { length: 0, width: 0, height: 0 },
    weightG: 0,
    totalOutputW: 0,
    input: { kind: "DC", voltage: "" },
    ports: [],
    wireless: category.wireless,
    technologies: [],
    certifications: category.defaultCerts.slice(),
    manufacturer: { ...settings.manufacturer },
    importer: { ...settings.importer },
    productionDate: new Date().toISOString().slice(0, 10),
    warrantyMonths: 12,
    storageHumidity: "75%",
    storageTempMin: -10,
    storageTempMax: 25,
    serviceLife: "необмежений за умови дотримання правил експлуатації",
    packageContents: [],
    ean13: "",
    languages: settings.languages.slice(),
    marketingBullets: {},
    extraSpecs: [],
    notes: "",
  };
}

export function newVariant(color = "", ean13 = ""): ProductVariant {
  return { id: newId("var"), color, ean13, nameSuffix: "" };
}

export function newProduct(profile: BrandProfile, category: CategoryMeta, settings: AppSettings): Product {
  const now = Date.now();
  return {
    id: newId("prod"),
    name: "",
    brandId: profile.id,
    category: category.id,
    rawSpec: "",
    spec: blankSpec(profile, category, settings),
    variants: [newVariant()],
    activeVariantId: "",
    stickerData: {},
    stickerText: "",
    utpBadges: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function activeVariant(product: Product): ProductVariant {
  return product.variants.find((v) => v.id === product.activeVariantId) ?? product.variants[0];
}
