import type { Category, Language } from "../types";

export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "EN", label: "English", flag: "🇬🇧" },
  { code: "DE", label: "Deutsch", flag: "🇩🇪" },
  { code: "ES", label: "Español", flag: "🇪🇸" },
  { code: "FR", label: "Français", flag: "🇫🇷" },
  { code: "UA", label: "Українська", flag: "🇺🇦" },
  { code: "IT", label: "Italiano", flag: "🇮🇹" },
  { code: "RO", label: "Română", flag: "🇷🇴" },
  { code: "PL", label: "Polski", flag: "🇵🇱" },
  { code: "BG", label: "Български", flag: "🇧🇬" },
];

// Матриця мовних сценаріїв (регламент ЗЕД MMA)
export const LANGUAGE_PRESETS: { id: string; label: string; languages: Language[] }[] = [
  {
    id: "standard8",
    label: "Стандарт (8 мов)",
    languages: ["EN", "DE", "ES", "FR", "UA", "IT", "RO", "PL"],
  },
  {
    id: "compact6",
    label: "Компакт (6 мов)",
    languages: ["EN", "UA", "RO", "PL", "BG", "ES"],
  },
];

export const INSTRUCTION_LANGUAGES = [
  "EN", "DE", "ES", "FR", "UA", "IT", "RO", "PL", "AR", "ZH", "PT", "BG", "KK", "UZ", "RU",
];

export const CATEGORY_NAMES: Record<Category, Record<Language, string>> = {
  car_charger: {
    EN: "Car charger",
    DE: "Auto-Ladegerät",
    ES: "Cargador de coche",
    FR: "Chargeur de voiture",
    UA: "Автомобільний зарядний пристрій",
    IT: "Caricatore da auto",
    RO: "Încărcător auto",
    PL: "Ładowarka samochodowa",
    BG: "Автомобилно зарядно устройство",
  },
  wall_charger: {
    EN: "Wall charger",
    DE: "Netzteil-Ladegerät",
    ES: "Cargador de pared",
    FR: "Chargeur secteur",
    UA: "Мережевий зарядний пристрій",
    IT: "Caricatore da parete",
    RO: "Încărcător de rețea",
    PL: "Ładowarka sieciowa",
    BG: "Мрежово зарядно устройство",
  },
  power_bank: {
    EN: "Power bank",
    DE: "Powerbank",
    ES: "Batería externa",
    FR: "Batterie externe",
    UA: "Портативний акумулятор (павербанк)",
    IT: "Power bank",
    RO: "Baterie externă",
    PL: "Power bank",
    BG: "Външна батерия",
  },
  cable: {
    EN: "USB cable",
    DE: "USB-Kabel",
    ES: "Cable USB",
    FR: "Câble USB",
    UA: "Кабель USB",
    IT: "Cavo USB",
    RO: "Cablu USB",
    PL: "Kabel USB",
    BG: "USB кабел",
  },
  tws: {
    EN: "True wireless earbuds",
    DE: "True-Wireless-Kopfhörer",
    ES: "Auriculares inalámbricos",
    FR: "Écouteurs sans fil",
    UA: "Бездротові навушники (TWS)",
    IT: "Auricolari wireless",
    RO: "Căști wireless",
    PL: "Słuchawki bezprzewodowe",
    BG: "Безжични слушалки",
  },
  case: {
    EN: "Case",
    DE: "Hülle",
    ES: "Funda",
    FR: "Coque",
    UA: "Чохол",
    IT: "Custodia",
    RO: "Husă",
    PL: "Etui",
    BG: "Калъф",
  },
  glass: {
    EN: "Screen protector",
    DE: "Displayschutzfolie",
    ES: "Protector de pantalla",
    FR: "Protection d'écran",
    UA: "Захисне скло",
    IT: "Protezione schermo",
    RO: "Folie de protecție",
    PL: "Szkło ochronne",
    BG: "Протектор за екран",
  },
  other: {
    EN: "Device",
    DE: "Gerät",
    ES: "Dispositivo",
    FR: "Appareil",
    UA: "Пристрій",
    IT: "Dispositivo",
    RO: "Dispozitiv",
    PL: "Urządzenie",
    BG: "Устройство",
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
  EN: { totalPower: "Total Power", inputVoltage: "Input voltage", outputPower: "Output power", max: "Max", output: "Output", input: "Input", model: "Model", protocols: "Protocols" },
  DE: { totalPower: "Gesamtleistung", inputVoltage: "Eingangsspannung", outputPower: "Ausgangsleistung", max: "Max.", output: "Ausgang", input: "Eingang", model: "Modell", protocols: "Protokolle" },
  ES: { totalPower: "Potencia total", inputVoltage: "Tensión de entrada", outputPower: "Potencia de salida", max: "Máx.", output: "Salida", input: "Entrada", model: "Modelo", protocols: "Protocolos" },
  FR: { totalPower: "Puissance totale", inputVoltage: "Tension d'entrée", outputPower: "Puissance de sortie", max: "Max.", output: "Sortie", input: "Entrée", model: "Modèle", protocols: "Protocoles" },
  UA: { totalPower: "Загальна потужність", inputVoltage: "Вхідна напруга", outputPower: "Вихідна потужність", max: "Макс.", output: "Вихід", input: "Вхід", model: "Модель", protocols: "Протоколи" },
  IT: { totalPower: "Potenza totale", inputVoltage: "Tensione in ingresso", outputPower: "Potenza in uscita", max: "Max.", output: "Uscita", input: "Ingresso", model: "Modello", protocols: "Protocolli" },
  RO: { totalPower: "Putere totală", inputVoltage: "Tensiune de intrare", outputPower: "Putere de ieșire", max: "Max.", output: "Ieșire", input: "Intrare", model: "Model", protocols: "Protocoale" },
  PL: { totalPower: "Moc całkowita", inputVoltage: "Napięcie wejściowe", outputPower: "Moc wyjściowa", max: "Maks.", output: "Wyjście", input: "Wejście", model: "Model", protocols: "Protokoły" },
  BG: { totalPower: "Обща мощност", inputVoltage: "Входно напрежение", outputPower: "Изходна мощност", max: "Макс.", output: "Изход", input: "Вход", model: "Модел", protocols: "Протоколи" },
};

// Одиниці СІ — міжнародні символи. UA/BG блок використовує кирилицю (регламент ЗЕД).
export const UNITS: Record<Language, { V: string; A: string; W: string; mAh: string; Wh: string }> = {
  EN: { V: "V", A: "A", W: "W", mAh: "mAh", Wh: "Wh" },
  DE: { V: "V", A: "A", W: "W", mAh: "mAh", Wh: "Wh" },
  ES: { V: "V", A: "A", W: "W", mAh: "mAh", Wh: "Wh" },
  FR: { V: "V", A: "A", W: "W", mAh: "mAh", Wh: "Wh" },
  UA: { V: "В", A: "А", W: "Вт", mAh: "мА·год", Wh: "Вт·год" },
  IT: { V: "V", A: "A", W: "W", mAh: "mAh", Wh: "Wh" },
  RO: { V: "V", A: "A", W: "W", mAh: "mAh", Wh: "Wh" },
  PL: { V: "V", A: "A", W: "W", mAh: "mAh", Wh: "Wh" },
  BG: { V: "В", A: "А", W: "Вт", mAh: "мА·год", Wh: "Вт·год" },
};
