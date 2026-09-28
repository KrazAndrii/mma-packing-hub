import type { Language, ProductSpec } from "../types";
import { buildSpecLines, categoryName, trimNum, type SpecLine } from "../generate/specs";

export function buildSpecTranslations(
  spec: ProductSpec,
  languages: Language[],
): Record<string, SpecLine[]> {
  const out: Record<string, SpecLine[]> = {};
  for (const lang of languages) {
    out[lang] = buildSpecLines(spec, lang);
  }
  return out;
}

interface Phrases {
  fast: (w: string) => string;
  multi: (n: number) => string;
  proto: (p: string) => string;
  batt: (cap: string) => string;
  compact: (g: string) => string;
  safe: string;
}

const PHRASES: Record<Language, Phrases> = {
  EN: {
    fast: (w) => `Fast charging up to ${w}`,
    multi: (n) => `Charges up to ${n} devices at once`,
    proto: (p) => `Supports ${p}`,
    batt: (cap) => `Battery capacity ${cap}`,
    compact: (g) => `Compact body, only ${g} g`,
    safe: "Protection against overheating and overvoltage",
  },
  UA: {
    fast: (w) => `Швидка зарядка до ${w}`,
    multi: (n) => `Заряджає до ${n} пристроїв одночасно`,
    proto: (p) => `Підтримка ${p}`,
    batt: (cap) => `Ємність акумулятора ${cap}`,
    compact: (g) => `Компактний корпус, вага лише ${g} г`,
    safe: "Захист від перегріву та перенапруги",
  },
  RO: {
    fast: (w) => `Încărcare rapidă până la ${w}`,
    multi: (n) => `Încarcă până la ${n} dispozitive simultan`,
    proto: (p) => `Suportă ${p}`,
    batt: (cap) => `Capacitate baterie ${cap}`,
    compact: (g) => `Corp compact, doar ${g} g`,
    safe: "Protecție împotriva supraîncălzirii și supratensiunii",
  },
  BG: {
    fast: (w) => `Бързо зареждане до ${w}`,
    multi: (n) => `Зарежда до ${n} устройства едновременно`,
    proto: (p) => `Поддръжка на ${p}`,
    batt: (cap) => `Капацитет на батерията ${cap}`,
    compact: (g) => `Компактен корпус, само ${g} г`,
    safe: "Защита от прегряване и свръхнапрежение",
  },
  ES: {
    fast: (w) => `Carga rápida de hasta ${w}`,
    multi: (n) => `Carga hasta ${n} dispositivos a la vez`,
    proto: (p) => `Compatible con ${p}`,
    batt: (cap) => `Capacidad de batería ${cap}`,
    compact: (g) => `Cuerpo compacto, solo ${g} g`,
    safe: "Protección contra sobrecalentamiento y sobretensión",
  },
  PL: {
    fast: (w) => `Szybkie ładowanie do ${w}`,
    multi: (n) => `Ładuje do ${n} urządzeń jednocześnie`,
    proto: (p) => `Obsługa ${p}`,
    batt: (cap) => `Pojemność baterii ${cap}`,
    compact: (g) => `Kompaktowa obudowa, tylko ${g} g`,
    safe: "Ochrona przed przegrzaniem i przepięciem",
  },
};

export function buildMarketingBullets(spec: ProductSpec, lang: Language): string[] {
  const p = PHRASES[lang];
  const bullets: string[] = [];

  if (spec.totalOutputW) bullets.push(p.fast(`${trimNum(spec.totalOutputW)}W`));
  const outputs = spec.ports.filter((x) => x.direction !== "input");
  if (outputs.length > 1) bullets.push(p.multi(outputs.length));

  const protocols = Array.from(new Set(spec.ports.flatMap((x) => x.protocols))).filter(Boolean);
  if (protocols.length) bullets.push(p.proto(protocols.slice(0, 3).join(", ")));

  if (spec.battery?.capacityMah) {
    bullets.push(p.batt(`${trimNum(spec.battery.capacityMah)} mAh`));
  }
  if (spec.weightG && spec.weightG < 300) {
    bullets.push(p.compact(trimNum(spec.weightG)));
  }
  bullets.push(p.safe);
  return bullets.slice(0, 5);
}

export function buildAllMarketing(spec: ProductSpec, languages: Language[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const lang of languages) out[lang] = buildMarketingBullets(spec, lang);
  return out;
}

export function specLinesToText(lines: SpecLine[]): string {
  return lines
    .map((l) => (l.children ? `${l.label}:\n` + l.children.map((c) => `  ${c}`).join("\n") : `${l.label}: ${l.value}`))
    .join("\n");
}

export function productHeading(spec: ProductSpec, lang: Language): string {
  return `${spec.brand} ${spec.model} — ${categoryName(spec, lang)}`;
}
