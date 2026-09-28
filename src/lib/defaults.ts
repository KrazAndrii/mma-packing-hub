import type { Language, ProductSpec } from "../lib/types";
import type { BrandProfile } from "../lib/profiles";

let counter = 0;
export function newId(prefix = "spec"): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

export function blankSpec(profile: BrandProfile): ProductSpec {
  return {
    id: newId(),
    brand: profile.name,
    category: "other",
    model: "",
    nameFrom1C: "",
    orderNumber: "",
    productNameUk: "",
    color: "",
    material: "кольорові метали, алюміній, полімери та електронні компоненти",
    dimensions: { length: 0, width: 0, height: 0 },
    weightG: 0,
    totalOutputW: 0,
    input: { kind: "DC", voltage: "" },
    ports: [],
    wireless: false,
    technologies: [],
    certifications: ["CE", "RoHS", "BIN", "TREFOIL", "MOBIUS"],
    manufacturer: { name: "", address: "", country: "Китай" },
    importer: {
      name: profile.importer.name,
      address: profile.importer.address,
      phone: profile.importer.phone,
      country: profile.importer.country,
    },
    productionDate: new Date().toISOString().slice(0, 10),
    warrantyMonths: 12,
    storageHumidity: "75%",
    storageTempMin: -10,
    storageTempMax: 25,
    serviceLife: "необмежений за умови дотримання правил експлуатації",
    packageContents: [],
    ean13: "",
    languages: profile.defaultLanguages as Language[],
    marketingBullets: {},
    extraSpecs: [],
    notes: "",
  };
}
