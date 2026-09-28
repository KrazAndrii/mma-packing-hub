import type { Language, PortOutput, PortSpec, ProductSpec } from "../types";
import { CATEGORY_NAMES, SPEC_LABELS, UNITS } from "../i18n/locales";

export function trimNum(value: number | string): string {
  const s = String(value).trim();
  if (!/^-?\d+(\.\d+)?$/.test(s)) return s;
  return String(Number(s));
}

export function formatOutputs(outputs: PortOutput[], lang: Language): string {
  const u = UNITS[lang];
  return outputs
    .map((o) => `${trimNum(o.volts)}${u.V}/${trimNum(o.amps)}${u.A}`)
    .join(", ");
}

export interface SpecLine {
  label: string;
  value?: string;
  children?: string[];
}

const BATTERY_LABEL: Record<Language, string> = {
  EN: "Battery capacity",
  DE: "Akkukapazität",
  ES: "Capacidad de la batería",
  FR: "Capacité de la batterie",
  UA: "Ємність акумулятора",
  IT: "Capacità della batteria",
  RO: "Capacitate baterie",
  PL: "Pojemność baterii",
  BG: "Капацитет на батерията",
};

export function portLines(port: PortSpec, lang: Language): string[] {
  const u = UNITS[lang];
  const label = SPEC_LABELS[lang];
  const lines: string[] = [];
  const head = port.label ?? port.type;
  const main = port.outputs.length
    ? `${head}: ${formatOutputs(port.outputs, lang)}${
        port.maxW ? ` (${trimNum(port.maxW)}${u.W} ${label.max})` : ""
      }`
    : head;
  lines.push(main);
  if (port.ppsOutputs && port.ppsOutputs.length) {
    lines.push(
      `PPS: ${formatOutputs(port.ppsOutputs, lang)}${port.maxW ? ` (${trimNum(port.maxW)}${u.W} ${label.max})` : ""}`,
    );
  }
  return lines;
}

export function buildSpecLines(spec: ProductSpec, lang: Language): SpecLine[] {
  const u = UNITS[lang];
  const label = SPEC_LABELS[lang];
  const lines: SpecLine[] = [];

  if (spec.totalOutputW) {
    lines.push({ label: label.totalPower, value: `${trimNum(spec.totalOutputW)}${u.W} (${label.max})` });
  }
  if (spec.battery && (spec.battery.capacityMah || spec.battery.wh)) {
    const parts: string[] = [];
    if (spec.battery.capacityMah) parts.push(`${trimNum(spec.battery.capacityMah)} ${u.mAh}`);
    if (spec.battery.voltage && spec.battery.wh) {
      parts.push(`${trimNum(spec.battery.voltage)} ${u.V} / ${trimNum(spec.battery.wh)} ${u.Wh}`);
    }
    lines.push({ label: BATTERY_LABEL[lang], value: parts.join(", ") });
  }
  if (spec.input.voltage) {
    const inputKind = spec.input.kind === "DC" ? "DC " : spec.input.kind === "AC" ? "AC " : "";
    lines.push({
      label: label.inputVoltage,
      value: `${inputKind}${trimNum(spec.input.voltage)}${u.V}${spec.input.current ? `/${trimNum(spec.input.current)}${u.A}` : ""}`,
    });
  }

  const children = spec.ports.flatMap((p) => portLines(p, lang));
  if (children.length) {
    lines.push({ label: label.outputPower, children });
  }

  for (const extra of spec.extraSpecs) {
    if (extra.label || extra.value) lines.push({ label: extra.label, value: extra.value });
  }
  return lines;
}

export function categoryName(spec: ProductSpec, lang: Language): string {
  return CATEGORY_NAMES[spec.category][lang];
}
