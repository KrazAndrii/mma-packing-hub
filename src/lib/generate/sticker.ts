import type { ProductSpec } from "../types";
import type { BrandProfile } from "../profiles";
import { CATEGORY_META } from "../profiles";
import { categoryName } from "./specs";

export interface StickerBlock {
  id: string;
  text: string;
  status?: "replace" | "adapt" | "verify";
}

export interface StickerResult {
  title: string;
  blocks: StickerBlock[];
  text: string;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${d}.${m}.${y}`;
}

const CHARACTERISTICS: Record<string, string> = {
  car_charger:
    "Характеристики автомобільного зарядного пристрою: смарт-баланс напруги. Сумісний з усіма кабелями з відповідними роз'ємами.",
  wall_charger:
    "Характеристики мережевого зарядного пристрою: смарт-баланс напруги, захист від перевантаження та перегріву. Сумісний з усіма кабелями з відповідними роз'ємами.",
  power_bank:
    "Характеристики портативного акумулятора: захист від перезаряду, перерозряду та короткого замикання. Сумісний з усіма кабелями з відповідними роз'ємами.",
  cable: "Характеристики кабелю: підвищена зносостійкість, стабільна передача даних і живлення.",
  tws: "Характеристики бездротових навушників: шумозаглушення, стабільне Bluetooth-з'єднання, компактний зарядний кейс.",
  case: "Характеристики чохла: захист корпусу від подряпин та ударів, точні вирізи під роз'єми.",
  glass: "Характеристики захисного скла: ударостійкість, олеофобне покриття, повна прозорість.",
  other: "Характеристики пристрою: відповідає заявленим технічним параметрам.",
};

export function buildSticker(spec: ProductSpec, profile: BrandProfile): StickerResult {
  const cat = spec.category;
  const name = categoryName(spec, "UA");
  const portSummary = spec.ports
    .map((p) => p.protocols.length ? `${p.type} ${p.protocols.join("/")}` : p.type)
    .join(" ");

  const title = [spec.model, portSummary, spec.totalOutputW ? `${spec.totalOutputW}W` : ""]
    .filter(Boolean)
    .join(" ")
    .trim();

  const blocks: StickerBlock[] = [];
  const push = (id: string, text: string, status?: StickerBlock["status"]) => {
    if (text && text.trim()) blocks.push({ id, text: text.trim(), status });
  };

  for (const line of profile.sticker.intro) {
    push(
      "intro",
      line.text
        .replace("{color}", spec.color)
        .replace("{length}", String(spec.dimensions.length))
        .replace("{width}", String(spec.dimensions.width))
        .replace("{height}", String(spec.dimensions.height))
        .replace("{weight}", String(spec.weightG)),
      line.status,
    );
  }

  push("characteristics", CHARACTERISTICS[cat] ?? CHARACTERISTICS.other, "adapt");

  if (spec.manufacturer.name || spec.manufacturer.address) {
    push(
      "manufacturer",
      `Виробник: ${spec.manufacturer.name}${spec.manufacturer.address ? ", " + spec.manufacturer.address : ""}${spec.manufacturer.country ? ", " + spec.manufacturer.country : ""}.`,
      "replace",
    );
  }

  if (spec.importer.name) {
    push(
      "importer",
      `Імпортер: ${spec.importer.name}${spec.importer.address ? ", " + spec.importer.address : ""}.${spec.importer.phone ? " Телефон: " + spec.importer.phone + "." : ""} З пропозиціями та скаргами звертатись до імпортера.`,
      "adapt",
    );
  }

  if (spec.productionDate) {
    push(
      "production",
      `Дата виробництва: ${formatDate(spec.productionDate)}. Номер партії співпадає з датою виробництва.`,
      "adapt",
    );
  }

  push(
    "warranty",
    `Гарантійний строк: ${spec.warrantyMonths} місяців з дати продажу. Гарантія не розповсюджується на товар, пошкоджений з вини користувача, або товар із механічними та іншими ушкодженнями, перевіряйте товар при покупці. Гарантійний талон і чек є підставою для обслуговування виробу імпортером.`,
    "adapt",
  );

  push(
    "usage",
    "Правила та умови ефективного і безпечного використання вказані в посібнику користувача. Використовуйте за призначенням, не використовуйте та не зберігайте його поблизу джерел тепла, не кидайте, не нагрівайте, уникайте контакту з рідинами та хімічними речовинами. Зберігайте в недоступному для дітей місці, не є іграшкою.",
    "adapt",
  );

  push(
    "storage",
    `Умови зберігання: при відносній вологості повітря до ${spec.storageHumidity}, при температурі від ${spec.storageTempMin}°С до +${spec.storageTempMax}°С.`,
    "adapt",
  );

  push("service", `Строк служби: ${spec.serviceLife}.`, "adapt");

  push(
    "disposal",
    "Правила утилізації: підлягає здачі в пункти збору для утилізації на спеціалізованих підприємствах.",
    "adapt",
  );

  if (spec.packageContents.length) {
    push("contents", `Комплектація: ${spec.packageContents.join(", ")}.`, "adapt");
  }

  const regs = profile.sticker.regulationsByCategory[cat] ?? [];
  if (regs.length) {
    push("regulations", regs.map((r) => r.text).join(" "), "verify");
  }

  const text = [title, ...blocks.map((b) => b.text)].join("\n\n");
  return { title, blocks, text };
}

export function categoryNoun(spec: ProductSpec): string {
  return CATEGORY_META[spec.category].uk;
}
