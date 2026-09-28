import type { Category, Language, ProductSpec } from "../types";
import type { Rule } from "../rules/types";

export interface CategoryMeta {
  uk: string;
  en: string;
  defaultCerts: string[];
  wireless: boolean;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  car_charger: {
    uk: "Автомобільний зарядний пристрій",
    en: "Car charger",
    defaultCerts: ["CE", "RoHS", "WEEE"],
    wireless: false,
  },
  wall_charger: {
    uk: "Мережевий зарядний пристрій",
    en: "Wall charger",
    defaultCerts: ["CE", "RoHS", "WEEE"],
    wireless: false,
  },
  power_bank: {
    uk: "Портативний акумулятор (павербанк)",
    en: "Power bank",
    defaultCerts: ["CE", "RoHS", "WEEE"],
    wireless: false,
  },
  cable: {
    uk: "Кабель USB",
    en: "USB cable",
    defaultCerts: ["CE", "RoHS"],
    wireless: false,
  },
  tws: {
    uk: "Бездротові навушники (TWS)",
    en: "True wireless earbuds",
    defaultCerts: ["CE", "RoHS", "WEEE", "RED"],
    wireless: true,
  },
  case: {
    uk: "Чохол",
    en: "Case",
    defaultCerts: ["RoHS"],
    wireless: false,
  },
  glass: {
    uk: "Захисне скло",
    en: "Screen protector",
    defaultCerts: ["RoHS"],
    wireless: false,
  },
  other: {
    uk: "Пристрій",
    en: "Device",
    defaultCerts: ["CE", "RoHS"],
    wireless: false,
  },
};

export interface LegalLine {
  text: string;
  status?: "replace" | "adapt" | "verify";
}

export interface StickerBlocks {
  intro: LegalLine[];
  regulationsByCategory: Record<Category, LegalLine[]>;
}

export interface BrandProfile {
  id: string;
  name: string;
  accent: string;
  defaultLanguages: Language[];
  engravingFont: "regular" | "medium" | "bold";
  orderLabel: string;
  madeInLabel: string;
  baseMarks: string[];
  importer: { name: string; address: string; phone: string; country: string };
  sticker: StickerBlocks;
  rules: Rule[];
  samples: ProductSpec[];
}

export function baseRules(): Rule[] {
  return [
    {
      id: "sum-ports-consistency",
      type: "sum_ports_equals_total",
      title: "Узгодженість потужності портів",
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
      title: "Обов'язкові європейські сертифікати",
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
      title: "Контрольна цифра штрихкоду EAN-13",
      severity: "error",
      message: "Штрихкод EAN-13 невалідний (не збігається контрольна цифра).",
      categories: "all",
      enabled: true,
    },
    {
      id: "forbidden-symbols",
      type: "forbidden_chars",
      title: "Заборонені символи та маркетингові штампи",
      severity: "warning",
      message: "Знайдені символи/позначки, які краще прибрати з пакування.",
      categories: "all",
      enabled: true,
      chars: ["\\", "⚡", "★", "✔", "✅", "🚀", "🔥", "❗", "№1", "Best Price", "100%"],
    },
    {
      id: "model-latin",
      type: "regex",
      title: "Модель лише латиницею/цифрами",
      severity: "warning",
      message: "Артикул/модель має містити лише латиницю, цифри та розділювачі.",
      categories: "all",
      enabled: true,
      field: "model",
      pattern: "^[A-Za-z0-9 _./\\-]+$",
      hint: "Приберіть кирилицю або спецсимволи з артикула",
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
      message: "Загальна потужність виходить за межі типового для категорії.",
      categories: ["car_charger", "wall_charger", "power_bank"],
      enabled: true,
      field: "totalOutputW",
      min: 1,
      max: 500,
      unit: "Вт",
    },
  ];
}

const UA_REG_EMC = "Технічний регламент з електромагнітної сумісності обладнання (ПКМУ №1077 від 16.12.2015 р.) модуль А.";
const UA_REG_LVD = "Технічний регламент низьковольтного електричного обладнання (ПКМУ №1097 від 16.12.2015 р.) модуль А.";
const UA_REG_ROHS = "Технічний регламент обмеження використання деяких небезпечних речовин в електричному та електронному обладнанні (ПКМУ №139 від 10.03.2017 р.) модуль А.";
const UA_REG_RADIO = "Технічний регламент радіообладнання (ПКМУ №355 від 24.05.2017 р.) — перевірити чинну редакцію у ВЕД.";

function defaultStickerBlocks(): StickerBlocks {
  return {
    intro: [
      { text: "Матеріал, склад: кольорові метали, алюміній, полімери та електронні компоненти.", status: "adapt" },
      { text: "Колір: {color}.", status: "adapt" },
      { text: "Розмір: {length} × {width} × {height} мм.  Вага: {weight} г.", status: "adapt" },
    ],
    regulationsByCategory: {
      car_charger: [
        { text: UA_REG_EMC },
        { text: UA_REG_LVD, status: "verify" },
        { text: UA_REG_ROHS },
      ],
      wall_charger: [
        { text: UA_REG_EMC },
        { text: UA_REG_LVD, status: "verify" },
        { text: UA_REG_ROHS },
      ],
      power_bank: [
        { text: UA_REG_EMC, status: "verify" },
        { text: UA_REG_ROHS },
        { text: "Технічний регламент щодо вимог до акумуляторів та батарей — уточнити номер та редакцію у ВЕД.", status: "verify" },
      ],
      cable: [{ text: UA_REG_ROHS }],
      tws: [
        { text: UA_REG_EMC },
        { text: UA_REG_RADIO, status: "verify" },
        { text: UA_REG_ROHS },
      ],
      case: [{ text: UA_REG_ROHS }],
      glass: [{ text: UA_REG_ROHS }],
      other: [
        { text: UA_REG_EMC, status: "verify" },
        { text: UA_REG_ROHS },
      ],
    },
  };
}

function sampleCarCharger(): ProductSpec {
  return {
    id: "sample-ridea-fc20",
    brand: "Ridea",
    category: "car_charger",
    model: "RD-FC20CLEBG",
    orderNumber: "0782",
    productNameUk: "Автомобільний зарядний пристрій",
    color: "чорний",
    material: "кольорові метали, алюміній, полімери та електронні компоненти",
    dimensions: { length: 81.9, width: 25.4, height: 25.4 },
    weightG: 16.8,
    totalOutputW: 20,
    input: { kind: "DC", voltage: "12-24", current: undefined },
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
    orderLabel: "",
    madeInLabel: "Made in China",
    baseMarks: ["CE", "RoHS", "BIN", "TREFOIL", "MOBIUS"],
    importer: {
      name: "ТОВ «Імпортно-Торгівельна Компанія»",
      address: "Україна, 65098, Одеська обл., місто Одеса, вул. Гена Іоганна, будинок 19",
      phone: "+380688578037",
      country: "Україна",
    },
    sticker: defaultStickerBlocks(),
    rules: baseRules(),
    samples: [sampleCarCharger()],
  },
  {
    id: "yoki",
    name: "Yoki",
    accent: "#16a34a",
    defaultLanguages: ["EN", "UA", "RO", "BG", "ES", "PL"],
    engravingFont: "medium",
    orderLabel: "",
    madeInLabel: "Made in China",
    baseMarks: ["CE", "RoHS", "BIN", "TREFOIL", "MOBIUS"],
    importer: {
      name: "ТОВ «ЙОКІ УКРАЇНА»",
      address: "Україна, 01001, м. Київ, вул. Хрещатик, буд. 1",
      phone: "+380442000000",
      country: "Україна",
    },
    sticker: defaultStickerBlocks(),
    rules: baseRules().map((r) =>
      r.id === "certs-required" && r.type === "required_certs"
        ? { ...r, base: ["CE", "RoHS", "WEEE"] }
        : r,
    ),
    samples: [],
  },
  {
    id: "inobi",
    name: "iNobi",
    accent: "#9333ea",
    defaultLanguages: ["EN", "UA", "RO", "BG", "ES", "PL"],
    engravingFont: "regular",
    orderLabel: "",
    madeInLabel: "Made in China",
    baseMarks: ["CE", "RoHS", "BIN", "TREFOIL", "MOBIUS"],
    importer: {
      name: "ТОВ «ІНОБІ ДІСТРІБ'ЮШН»",
      address: "Україна, 02000, м. Київ, просп. Перемоги, буд. 10",
      phone: "+380445000000",
      country: "Україна",
    },
    sticker: defaultStickerBlocks(),
    rules: baseRules(),
    samples: [],
  },
];

export function getProfile(id: string): BrandProfile {
  return PROFILES.find((p) => p.id === id) ?? PROFILES[0];
}
