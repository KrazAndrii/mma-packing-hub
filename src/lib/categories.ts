import type { CategoryMeta } from "./types";

const REG_EMC = "Технічний регламент з електромагнітної сумісності обладнання (ПКМУ №1077 від 16.12.2015 р.) модуль А.";
const REG_LVD = "Технічний регламент низьковольтного електричного обладнання (ПКМУ №1097 від 16.12.2015 р.) модуль А.";
const REG_ROHS = "Технічний регламент обмеження використання деяких небезпечних речовин в електричному та електронному обладнанні (ПКМУ №139 від 10.03.2017 р.) модуль А.";
const REG_RADIO = "Технічний регламент радіообладнання (ПКМУ №355 від 24.05.2017 р.) — уточнити чинну редакцію у ВЕД.";
const REG_BATT = "Технічний регламент щодо вимог до акумуляторів та батарей — уточнити номер і редакцію у ВЕД.";

const CHARACTERISTICS: Record<string, string> = {
  azu: "Характеристики автомобільного зарядного пристрою: смарт-баланс напруги. Сумісний з усіма кабелями з відповідними роз'ємами.",
  szu: "Характеристики мережевого зарядного пристрою: смарт-баланс напруги, захист від перевантаження та перегріву. Сумісний з усіма кабелями з відповідними роз'ємами.",
  bzu: "Характеристики бездротового зарядного пристрою: індукційна зарядка, захист від перегріву та сторонніх металевих предметів.",
  power_bank: "Характеристики портативного акумулятора: захист від перезаряду, перерозряду та короткого замикання. Сумісний з усіма кабелями з відповідними роз'ємами.",
  tws: "Характеристики бездротових навушників: стабільне Bluetooth-з'єднання, компактний зарядний кейс.",
  wired: "Характеристики дротових навушників: чистий звук, вбудований мікрофон і пульт керування.",
  usb_hub: "Характеристики USB-хаба: розширення портів, стабільна передача даних і живлення.",
  smart_watch: "Характеристики смарт-годинника: моніторинг активності, повідомлення, тривалий час роботи.",
  car_holder: "Характеристики автомобільного тримача: надійна фіксація, регулювання кута, сумісність з більшістю смартфонів.",
  cable: "Характеристики кабелю: підвищена зносостійкість, стабільна передача даних і живлення.",
};

const REGS: Record<string, string[]> = {
  azu: [REG_EMC, REG_LVD, REG_ROHS],
  szu: [REG_EMC, REG_LVD, REG_ROHS],
  bzu: [REG_EMC, REG_RADIO, REG_ROHS],
  power_bank: [REG_EMC, REG_ROHS, REG_BATT],
  tws: [REG_EMC, REG_RADIO, REG_ROHS],
  wired: [REG_EMC, REG_ROHS],
  usb_hub: [REG_EMC, REG_ROHS],
  smart_watch: [REG_EMC, REG_RADIO, REG_ROHS, REG_BATT],
  car_holder: [REG_EMC, REG_ROHS],
  cable: [REG_ROHS],
};

function template(_id: string): string {
  return [
    "{{title}}",
    "",
    "Матеріал, склад: {{material}}.",
    "",
    "Колір: {{color}}.",
    "",
    "Розмір: {{length}} × {{width}} × {{height}} мм.  Вага: {{weight}} г.",
    "",
    "{{characteristics}}",
    "",
    "Виробник: {{manufacturer}}, {{manufacturerAddress}}, {{manufacturerCountry}}.",
    "",
    "Імпортер: {{importer}}, {{importerAddress}}. Телефон: {{importerPhone}}. З пропозиціями та скаргами звертатись до імпортера.",
    "",
    "Дата виробництва: {{productionDate}}. Номер партії співпадає з датою виробництва.",
    "",
    "Гарантійний строк: {{warrantyMonths}} місяців з дати продажу. Гарантія не розповсюджується на товар, пошкоджений з вини користувача, або товар із механічними та іншими ушкодженнями, перевіряйте товар при покупці. Гарантійний талон і чек є підставою для обслуговування виробу імпортером.",
    "",
    "Правила та умови ефективного і безпечного використання вказані в посібнику користувача. Використовуйте за призначенням, не використовуйте та не зберігайте його поблизу джерел тепла, не кидайте, не нагрівайте, уникайте контакту з рідинами та хімічними речовинами. Зберігайте в недоступному для дітей місці, не є іграшкою.",
    "",
    "Умови зберігання: при відносній вологості повітря до {{storageHumidity}}, при температурі від {{tempMin}}°С до +{{tempMax}}°С.",
    "",
    "Строк служби: {{serviceLife}}.",
    "",
    "Правила утилізації: {{disposal}}.",
    "",
    "Комплектація: {{contents}}.",
    "",
    "{{regulations}}",
  ].join("\n");
}

export const DEFAULT_CATEGORIES: CategoryMeta[] = [
  { id: "azu", uk: "АЗУ (автомобільний зарядний пристрій)", en: "Car charger", defaultCerts: ["CE", "RoHS", "WEEE"], wireless: false, stickerTemplate: template("azu") },
  { id: "szu", uk: "СЗУ (мережевий зарядний пристрій)", en: "Wall charger", defaultCerts: ["CE", "RoHS", "WEEE"], wireless: false, stickerTemplate: template("szu") },
  { id: "bzu", uk: "БЗУ (бездротовий зарядний пристрій)", en: "Wireless charger", defaultCerts: ["CE", "RoHS", "RED", "Qi2"], wireless: true, stickerTemplate: template("bzu") },
  { id: "power_bank", uk: "Power Bank (портативний акумулятор)", en: "Power bank", defaultCerts: ["CE", "RoHS", "WEEE"], wireless: false, stickerTemplate: template("power_bank") },
  { id: "tws", uk: "TWS (бездротові навушники)", en: "TWS earbuds", defaultCerts: ["CE", "RoHS", "RED"], wireless: true, stickerTemplate: template("tws") },
  { id: "wired", uk: "Проводные наушники (дротові)", en: "Wired earphones", defaultCerts: ["CE", "RoHS"], wireless: false, stickerTemplate: template("wired") },
  { id: "usb_hub", uk: "USB Hub (концентратор)", en: "USB hub", defaultCerts: ["CE", "RoHS"], wireless: false, stickerTemplate: template("usb_hub") },
  { id: "smart_watch", uk: "Smart Watch (смарт-годинник)", en: "Smart watch", defaultCerts: ["CE", "RoHS", "RED", "WEEE"], wireless: true, stickerTemplate: template("smart_watch") },
  { id: "car_holder", uk: "Автодержателі", en: "Car holder", defaultCerts: ["CE", "RoHS"], wireless: false, stickerTemplate: template("car_holder") },
  { id: "cable", uk: "Кабелі", en: "Cables", defaultCerts: ["CE", "RoHS"], wireless: false, stickerTemplate: template("cable") },
];

export function getCategory(categories: CategoryMeta[], id: string): CategoryMeta {
  return (
    categories.find((c) => c.id === id) ?? {
      id,
      uk: id,
      en: id,
      defaultCerts: ["CE", "RoHS"],
      wireless: false,
      stickerTemplate: template(id),
    }
  );
}

export function categoryCharacteristics(id: string): string {
  return CHARACTERISTICS[id] ?? CHARACTERISTICS.cable;
}

export function categoryRegulations(id: string): string[] {
  return REGS[id] ?? [REG_ROHS];
}

export const STICKER_VARIABLES: { key: string; label: string }[] = [
  { key: "title", label: "Заголовок (модель + УТП + потужність)" },
  { key: "model", label: "Модель" },
  { key: "productName", label: "Назва товару (UA)" },
  { key: "utp", label: "УТП (англ. значки)" },
  { key: "power", label: "Загальна потужність" },
  { key: "material", label: "Матеріал, склад" },
  { key: "color", label: "Колір" },
  { key: "length", label: "Довжина" },
  { key: "width", label: "Ширина" },
  { key: "height", label: "Висота" },
  { key: "weight", label: "Вага" },
  { key: "characteristics", label: "Характеристики (за категорією)" },
  { key: "manufacturer", label: "Виробник" },
  { key: "manufacturerAddress", label: "Адреса виробника" },
  { key: "manufacturerCountry", label: "Країна виробника" },
  { key: "importer", label: "Імпортер" },
  { key: "importerAddress", label: "Адреса імпортера" },
  { key: "importerPhone", label: "Телефон імпортера" },
  { key: "productionDate", label: "Дата виробництва" },
  { key: "batch", label: "Партія / замовлення" },
  { key: "warrantyMonths", label: "Гарантія (міс.)" },
  { key: "storageHumidity", label: "Вологість зберігання" },
  { key: "tempMin", label: "Темп. мін." },
  { key: "tempMax", label: "Темп. макс." },
  { key: "serviceLife", label: "Строк служби" },
  { key: "disposal", label: "Утилізація" },
  { key: "contents", label: "Комплектація" },
  { key: "regulations", label: "Технічні регламенти" },
  { key: "marks", label: "Маніпуляційні знаки (текст)" },
  { key: "ean13", label: "Штрихкод EAN-13" },
];
