import type { Language, ProductSpec, CompanyInfo } from "../types";
import type { Rule } from "../rules/types";

export interface BrandProfile {
  id: string;
  name: string;
  accent: string;
  defaultLanguages: Language[];
  engravingFont: "regular" | "medium" | "bold";
  madeInLabel: string;
  baseMarks: string[];
  importer: CompanyInfo;
  rules: Rule[];
  samples: ProductSpec[];
}

export function baseRules(): Rule[] {
  return [
    {
      id: "sum-ports-consistency",
      type: "sum_ports_equals_total",
      title: "Сума потужностей портів",
      severity: "error",
      message: "Заявлена загальна потужність не узгоджується з потужностями портів.",
      categories: "all",
      enabled: true,
      toleranceW: 0.05,
      strict: false,
    },
    {
      id: "certs-required",
      type: "required_certs",
      title: "Обов'язкові сертифікати",
      severity: "error",
      message: "Відсутні обов'язкові сертифікати для цієї категорії.",
      categories: "all",
      enabled: true,
      base: ["CE", "RoHS"],
      ifWireless: ["RED"],
    },
    {
      id: "required-fields",
      type: "required_fields",
      title: "Обов'язкові поля маркування",
      severity: "error",
      message: "Не заповнені обов'язкові поля, потрібні для імпорту та друку.",
      categories: "all",
      enabled: true,
      fields: [
        "model",
        "productNameUk",
        "color",
        "material",
        "manufacturer.name",
        "manufacturer.address",
        "importer.name",
        "importer.address",
        "productionDate",
      ],
    },
    {
      id: "ean-checksum",
      type: "ean_checksum",
      title: "Контрольна цифра штрихкоду",
      severity: "error",
      message: "Штрихкод EAN-13 невалідний (не збігається контрольна цифра).",
      categories: "all",
      enabled: true,
    },
    {
      id: "forbidden-symbols",
      type: "forbidden_chars",
      title: "Зайві символи та маркетингові штампи",
      severity: "warning",
      message: "Знайдені символи, які краще прибрати з пакування.",
      categories: "all",
      enabled: true,
      chars: ["\\", "⚡", "★", "✔", "✅", "🚀", "🔥", "❗", "№1", "Best Price", "100%"],
    },
    {
      id: "model-latin",
      type: "regex",
      title: "Модель лише латиницею",
      severity: "warning",
      message: "Артикул/модель має містити лише латиницю, цифри та розділювачі.",
      categories: "all",
      enabled: true,
      field: "model",
      pattern: "^[A-Za-z0-9 _./\\-]+$",
      hint: "Приберіть кирилицю або спецсимволи з артикула",
    },
    {
      id: "engraving-no-backslash",
      type: "engraving_regex",
      title: "Немає зворотного слеша",
      severity: "error",
      message: "У гравіюванні використано зворотний слеш (\\) — дозволено лише прямий (/).",
      categories: "all",
      enabled: true,
      pattern: "\\\\",
      hint: "Дозволено лише прямий слеш /",
    },
    {
      id: "engraving-no-unit-period",
      type: "engraving_regex",
      title: "Немає крапки після одиниць",
      severity: "error",
      message: "Після одиниць (В, А, Вт, V, A, W, mAh, Wh) крапка не ставиться.",
      categories: "all",
      enabled: true,
      pattern: "(?:Вт|мА·год|Вт·год|mAh|Wh|В|А|W|V|A)\\.",
      hint: "Одиниці — міжнародні символи, без крапки",
    },
    {
      id: "weight-positive",
      type: "range",
      title: "Коректна вага товару",
      severity: "error",
      message: "Вага товару виглядає некоректно.",
      categories: "all",
      enabled: true,
      field: "weightG",
      min: 0.1,
      max: 20000,
      unit: "г",
    },
    {
      id: "total-power-range",
      type: "range",
      title: "Реалістична загальна потужність",
      severity: "warning",
      message: "Загальна потужність виходить за типові межі.",
      categories: "all",
      enabled: true,
      field: "totalOutputW",
      min: 1,
      max: 500,
      unit: "Вт",
    },
  ];
}

function sampleCarCharger(): ProductSpec {
  return {
    brand: "Ridea",
    category: "azu",
    model: "RD-FC20CLEBG",
    nameFrom1C: "RIDEA DRIFT",
    orderNumber: "0782",
    productNameUk: "Автомобільний зарядний пристрій",
    color: "чорний",
    material: "кольорові метали, алюміній, полімери та електронні компоненти",
    dimensions: { length: 81.9, width: 25.4, height: 25.4 },
    weightG: 16.8,
    totalOutputW: 20,
    input: { kind: "DC", voltage: "12-24" },
    ports: [
      {
        id: "usb-c",
        type: "USB-C",
        protocols: ["PD3.0", "PPS"],
        direction: "output",
        maxW: 20,
        outputs: [
          { volts: "5", amps: "3" },
          { volts: "9", amps: "2.22" },
          { volts: "12", amps: "1.67" },
        ],
        ppsOutputs: [
          { volts: "3.3-5.9", amps: "3" },
          { volts: "3.3-11", amps: "2" },
        ],
      },
      {
        id: "usb-a",
        type: "USB-A",
        protocols: ["QC3.0"],
        direction: "output",
        maxW: 15,
        outputs: [{ volts: "5", amps: "3" }],
      },
    ],
    wireless: false,
    technologies: [],
    certifications: ["CE", "RoHS", "BIN", "TREFOIL", "MOBIUS"],
    manufacturer: {
      name: "Шеньчжень, Кайбіноу Електронік Текнолоджі Компані ЛТД, 4Ф",
      address: "Доньянг Він Вінтер, Центр Роуда Далі Тун, Нанхай Сі Регіон, Фошань, Китай",
      country: "Китай",
    },
    importer: {
      name: "ТОВ «Імпортно-Торгівельна Компанія»",
      address: "Україна, 65098, Одеська обл., місто Одеса, вул. Гена Іоганна, будинок 19",
      phone: "+380688578037",
      country: "Україна",
    },
    productionDate: "2026-06-15",
    warrantyMonths: 12,
    storageHumidity: "75%",
    storageTempMin: -10,
    storageTempMax: 25,
    serviceLife: "необмежений за умови дотримання правил експлуатації",
    packageContents: ["автомобільний зарядний пристрій х 1", "посібник користувача з гарантійним талоном х 1"],
    ean13: "",
    languages: ["EN", "UA", "RO", "BG", "ES", "PL"],
    marketingBullets: {},
    extraSpecs: [],
    notes: "",
  };
}

export const PROFILES: BrandProfile[] = [
  {
    id: "ridea",
    name: "Ridea",
    accent: "#2563eb",
    defaultLanguages: ["EN", "UA", "RO", "BG", "ES", "PL"],
    engravingFont: "regular",
    madeInLabel: "Made in China",
    baseMarks: ["CE", "RoHS", "BIN", "TREFOIL", "MOBIUS"],
    importer: {
      name: "ТОВ «Імпортно-Торгівельна Компанія»",
      address: "Україна, 65098, Одеська обл., місто Одеса, вул. Гена Іоганна, будинок 19",
      phone: "+380688578037",
      country: "Україна",
    },
    rules: baseRules(),
    samples: [sampleCarCharger()],
  },
  {
    id: "yoki",
    name: "Yoki",
    accent: "#16a34a",
    defaultLanguages: ["EN", "UA", "RO", "BG", "ES", "PL"],
    engravingFont: "medium",
    madeInLabel: "Made in China",
    baseMarks: ["CE", "RoHS", "BIN", "TREFOIL", "MOBIUS"],
    importer: {
      name: "ТОВ «ЙОКІ УКРАЇНА»",
      address: "Україна, 01001, м. Київ, вул. Хрещатик, буд. 1",
      phone: "+380442000000",
      country: "Україна",
    },
    rules: baseRules(),
    samples: [],
  },
  {
    id: "inobi",
    name: "iNobi",
    accent: "#9333ea",
    defaultLanguages: ["EN", "UA", "RO", "BG", "ES", "PL"],
    engravingFont: "regular",
    madeInLabel: "Made in China",
    baseMarks: ["CE", "RoHS", "BIN", "TREFOIL", "MOBIUS"],
    importer: {
      name: "ТОВ «ІНОБІ ДІСТРІБ'ЮШН»",
      address: "Україна, 02000, м. Київ, просп. Перемоги, буд. 10",
      phone: "+380445000000",
      country: "Україна",
    },
    rules: baseRules(),
    samples: [],
  },
];

export function getProfile(id: string): BrandProfile {
  return PROFILES.find((p) => p.id === id) ?? PROFILES[0];
}
