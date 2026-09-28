import type { Category, Language } from "../types";

export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "EN", label: "English", flag: "🇬🇧" },
  { code: "UA", label: "Українська", flag: "🇺🇦" },
  { code: "RO", label: "Română", flag: "🇷🇴" },
  { code: "BG", label: "Български", flag: "🇧🇬" },
  { code: "ES", label: "Español", flag: "🇪🇸" },
  { code: "PL", label: "Polski", flag: "🇵🇱" },
];

export const CATEGORY_NAMES: Record<Category, Record<Language, string>> = {
  car_charger: {
    EN: "Car charger",
    UA: "Автомобільний зарядний пристрій",
    RO: "Încărcător auto",
    BG: "Автомобилно зарядно устройство",
    ES: "Cargador de coche",
    PL: "Ładowarka samochodowa",
  },
  wall_charger: {
    EN: "Wall charger",
    UA: "Мережевий зарядний пристрій",
    RO: "Încărcător de rețea",
    BG: "Мрежово зарядно устройство",
    ES: "Cargador de pared",
    PL: "Ładowarka sieciowa",
  },
  power_bank: {
    EN: "Power bank",
    UA: "Портативний акумулятор (павербанк)",
    RO: "Baterie externă",
    BG: "Външна батерия",
    ES: "Batería externa",
    PL: "Power bank",
  },
  cable: {
    EN: "USB cable",
    UA: "Кабель USB",
    RO: "Cablu USB",
    BG: "USB кабел",
    ES: "Cable USB",
    PL: "Kabel USB",
  },
  tws: {
    EN: "True wireless earbuds",
    UA: "Бездротові навушники (TWS)",
    RO: "Căști wireless",
    BG: "Безжични слушалки",
    ES: "Auriculares inalámbricos",
    PL: "Słuchawki bezprzewodowe",
  },
  case: {
    EN: "Case",
    UA: "Чохол",
    RO: "Husă",
    BG: "Калъф",
    ES: "Funda",
    PL: "Etui",
  },
  glass: {
    EN: "Screen protector",
    UA: "Захисне скло",
    RO: "Folie de protecție",
    BG: "Протектор за екран",
    ES: "Protector de pantalla",
    PL: "Szkło ochronne",
  },
  other: {
    EN: "Device",
    UA: "Пристрій",
    RO: "Dispozitiv",
    BG: "Устройство",
    ES: "Dispositivo",
    PL: "Urządzenie",
  },
};

interface SpecLabels {
  totalPower: string;
  inputVoltage: string;
  outputPower: string;
  max: string;
  output: string;
  input: string;
  model: string;
  protocols: string;
}

export const SPEC_LABELS: Record<Language, SpecLabels> = {
  EN: {
    totalPower: "Total Power",
    inputVoltage: "Input voltage",
    outputPower: "Output power",
    max: "Max",
    output: "Output",
    input: "Input",
    model: "Model",
    protocols: "Protocols",
  },
  UA: {
    totalPower: "Загальна потужність",
    inputVoltage: "Вхідна напруга",
    outputPower: "Вихідна потужність",
    max: "Макс.",
    output: "Вихід",
    input: "Вхід",
    model: "Модель",
    protocols: "Протоколи",
  },
  RO: {
    totalPower: "Putere totală",
    inputVoltage: "Tensiune de intrare",
    outputPower: "Putere de ieșire",
    max: "Max.",
    output: "Ieșire",
    input: "Intrare",
    model: "Model",
    protocols: "Protocoale",
  },
  BG: {
    totalPower: "Обща мощност",
    inputVoltage: "Входно напрежение",
    outputPower: "Изходна мощност",
    max: "Макс.",
    output: "Изход",
    input: "Вход",
    model: "Модел",
    protocols: "Протоколи",
  },
  ES: {
    totalPower: "Potencia total",
    inputVoltage: "Tensión de entrada",
    outputPower: "Potencia de salida",
    max: "Máx.",
    output: "Salida",
    input: "Entrada",
    model: "Modelo",
    protocols: "Protocolos",
  },
  PL: {
    totalPower: "Moc całkowita",
    inputVoltage: "Napięcie wejściowe",
    outputPower: "Moc wyjściowa",
    max: "Maks.",
    output: "Wyjście",
    input: "Wejście",
    model: "Model",
    protocols: "Protokoły",
  },
};

export const UNITS: Record<Language, { V: string; A: string; W: string }> = {
  EN: { V: "V", A: "A", W: "W" },
  UA: { V: "В", A: "А", W: "Вт" },
  RO: { V: "V", A: "A", W: "W" },
  BG: { V: "В", A: "А", W: "Вт" },
  ES: { V: "V", A: "A", W: "W" },
  PL: { V: "V", A: "A", W: "W" },
};

export const MARKETING_TEMPLATES: Record<Language, (name: string, power: string) => string[]> = {
  EN: (name, power) => [`Fast charging up to ${power}`, `Compact and reliable ${name.toLowerCase()}`, "Smart voltage balancing"],
  UA: (name, power) => [`Швидка зарядка до ${power}`, `Компактний та надійний ${name.toLowerCase()}`, "Розумний баланс напруги"],
  RO: (name, power) => [`Încărcare rapidă până la ${power}`, `${name} compact și fiabil`, "Echilibrare inteligentă a tensiunii"],
  BG: (name, power) => [`Бързо зареждане до ${power}`, `Компактен и надежден ${name.toLowerCase()}`, "Интелигентен баланс на напрежението"],
  ES: (name, power) => [`Carga rápida de hasta ${power}`, `${name} compacto y fiable`, "Equilibrio inteligente de tensión"],
  PL: (name, power) => [`Szybkie ładowanie do ${power}`, `Kompaktowa i niezawodna ${name.toLowerCase()}`, "Inteligentne równoważenie napięcia"],
};
