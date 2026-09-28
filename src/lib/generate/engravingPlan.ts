import type { EngravingFormat, EngravingSection, PortSpec, ProductSpec } from "../types";
import type { BrandProfile } from "../profiles";
import { trimNum } from "./specs";

export type PortLineStyle = "prefix" | "suffix";

export interface PlanLine {
  kind: "text" | "subheader" | "symbols";
  text: string;
  section: EngravingSection;
  bold?: boolean;
  marks?: string[];
}

export interface EngravingPlan {
  format: EngravingFormat;
  lines: PlanLine[];
  marks: string[];
  text: string;
}

export interface PlanOptions {
  format?: EngravingFormat;
  portLineStyle?: PortLineStyle;
}

export const MARK_LABELS: Record<string, string> = {
  CE: "CE",
  RoHS: "RoHS",
  BIN: "Урна",
  TREFOIL: "Трилистник",
  MOBIUS: "Петля Мёбиуса",
  QI: "Qi",
  QI2: "Qi2",
};

const MARK_ALIASES: Record<string, string> = {
  WEEE: "BIN",
  Recycling: "TREFOIL",
  Trefoil: "TREFOIL",
  Mobius: "MOBIUS",
  "Петля Мёбиуса": "MOBIUS",
  "Урна": "BIN",
  "Трилистник": "TREFOIL",
  Qi: "QI",
  "Qi2": "QI2",
  "Qi2.2": "QI2",
  QI2: "QI2",
  QI: "QI",
};

const VISUAL_MARKS = ["CE", "RoHS", "BIN", "TREFOIL", "MOBIUS", "QI", "QI2"];

export function canonicalMark(code: string): string {
  return MARK_ALIASES[code] ?? code;
}

export function markLabel(code: string): string {
  const c = canonicalMark(code);
  return MARK_LABELS[c] ?? c;
}

function sp(mode: EngravingFormat): string {
  return mode === "full" ? " " : "";
}

function slash(mode: EngravingFormat): string {
  return mode === "full" ? " / " : "/";
}

function va(volts: string, amps: string, mode: EngravingFormat): string {
  return `${trimNum(volts)}${sp(mode)}V${slash(mode)}${trimNum(amps)}${sp(mode)}A`;
}

function wMax(w: number | undefined, mode: EngravingFormat): string {
  if (w === undefined || w === null || Number.isNaN(w) || w === 0) return "";
  return ` (${trimNum(w)}${sp(mode)}W Max)`;
}

export function portLine(port: PortSpec, mode: EngravingFormat, style: PortLineStyle = "suffix"): string {
  const dir = port.direction === "input" ? "Input" : "Output";
  const label =
    port.label ??
    (style === "prefix" ? `${dir} ${port.type}` : `${port.type} ${dir}`);
  const body = port.outputs.map((o) => va(o.volts, o.amps, mode)).join(", ") + wMax(port.maxW, mode);
  return `${label}: ${body}`;
}

export function ppsLine(port: PortSpec, mode: EngravingFormat): string | null {
  if (!port.ppsOutputs || port.ppsOutputs.length === 0) return null;
  const body = port.ppsOutputs.map((o) => va(o.volts, o.amps, mode)).join(", ") + wMax(port.maxW, mode);
  return `PPS: ${body}`;
}

function batteryLine(spec: ProductSpec, mode: EngravingFormat): string | null {
  const b = spec.battery;
  if (!b || (!b.capacityMah && !b.wh)) return null;
  const parts: string[] = [];
  if (b.capacityMah) parts.push(`${trimNum(b.capacityMah)}${sp(mode)}mAh`);
  if (b.voltage && b.wh) {
    parts.push(`${trimNum(b.voltage)}${sp(mode)}V${slash(mode)}${trimNum(b.wh)}${sp(mode)}Wh`);
  } else if (b.voltage) {
    parts.push(`${trimNum(b.voltage)}${sp(mode)}V`);
  } else if (b.wh) {
    parts.push(`${trimNum(b.wh)}${sp(mode)}Wh`);
  }
  return `Battery Capacity: ${parts.join(", ")}`;
}

function inputLine(spec: ProductSpec, mode: EngravingFormat): string | null {
  const i = spec.input;
  if (!i.voltage) return null;
  const parts: string[] = [];
  parts.push(`${trimNum(i.voltage)}${sp(mode)}V`);
  if (i.kind === "AC" && i.frequency) parts.push(`${trimNum(i.frequency)}${sp(mode)}Hz`);
  if (i.current) parts.push(`${trimNum(i.current)}${sp(mode)}A`);
  return `${i.kind === "AC" ? "AC" : "DC"} Input: ${parts.join(", ")}${wMax(i.maxW, mode)}`;
}

export function buildEngravingPlan(spec: ProductSpec, profile: BrandProfile, options: PlanOptions | EngravingFormat = {}): EngravingPlan {
  const opts: PlanOptions = typeof options === "string" ? { format: options } : options;
  const format: EngravingFormat = opts.format ?? "full";
  const style: PortLineStyle = opts.portLineStyle ?? "suffix";

  const lines: PlanLine[] = [];
  const bySection = (section: EngravingSection) => spec.extraSpecs.filter((e) => e.section === section);

  // 1. Назва / Модель виробу + основні характеристики (винятки)
  lines.push({ kind: "text", text: `Model: ${spec.model}`, section: 1, bold: true });
  const battery = batteryLine(spec, format);
  if (battery) lines.push({ kind: "text", text: battery, section: 1 });
  if (spec.magneticForce) lines.push({ kind: "text", text: `Magnetic Pull Force: ${spec.magneticForce}`, section: 1 });
  if (spec.driverSize) lines.push({ kind: "text", text: `Driver Size: ${spec.driverSize}`, section: 1 });
  if (spec.audioCodecs) lines.push({ kind: "text", text: `Audio Codecs: ${spec.audioCodecs}`, section: 1 });
  bySection(1).forEach((e) => lines.push({ kind: "text", text: `${e.label}: ${e.value}`, section: 1 }));

  // 2. Вхідні параметри
  const input = inputLine(spec, format);
  if (input) lines.push({ kind: "text", text: input, section: 2 });
  spec.ports.filter((p) => p.direction === "input").forEach((p) =>
    lines.push({ kind: "text", text: portLine(p, format, style), section: 2 }),
  );
  bySection(2).forEach((e) => lines.push({ kind: "text", text: `${e.label}: ${e.value}`, section: 2 }));

  // 3. Вихідні параметри
  if (spec.modeLabel) lines.push({ kind: "subheader", text: `${spec.modeLabel}:`, section: 3 });
  spec.ports
    .filter((p) => p.direction !== "input")
    .forEach((p) => {
      lines.push({ kind: "text", text: portLine(p, format, style), section: 3 });
      const pps = ppsLine(p, format);
      if (pps) lines.push({ kind: "text", text: pps, section: 3 });
    });
  if (spec.totalOutputW && spec.ports.filter((p) => p.direction !== "input").length > 1) {
    lines.push({
      kind: "text",
      text: `Total Output: ${trimNum(spec.totalOutputW)}${sp(format)}W Max`,
      section: 3,
    });
  }
  if (spec.conversionRate) {
    lines.push({
      kind: "text",
      text: `Power Conversion rate: ≥${sp(format)}${trimNum(spec.conversionRate)}%`,
      section: 3,
    });
  }
  if (spec.dataTransfer) lines.push({ kind: "text", text: `Data Transfer: ${spec.dataTransfer}`, section: 3 });
  bySection(3).forEach((e) => lines.push({ kind: "text", text: `${e.label}: ${e.value}`, section: 3 }));

  // 4. Стандарти та технології
  if (spec.technologies.length) {
    lines.push({ kind: "text", text: `Standard: ${spec.technologies.join(" / ")}`, section: 4 });
  }
  bySection(4).forEach((e) => lines.push({ kind: "text", text: `${e.label}: ${e.value}`, section: 4 }));

  // 5. Маніпуляційні знаки та сертифікація
  const marks = resolveMarks(spec, profile);
  lines.push({
    kind: "symbols",
    text: marks.map((m) => `[${markLabel(m)}]`).join(" "),
    section: 5,
    marks,
  });
  bySection(5).forEach((e) => lines.push({ kind: "text", text: `${e.label}: ${e.value}`, section: 5 }));

  // 6. Країна виробництва
  const madeIn = profile.madeInLabel || "Made in China";
  lines.push({ kind: "text", text: madeIn, section: 6 });
  bySection(6).forEach((e) => lines.push({ kind: "text", text: `${e.label}: ${e.value}`, section: 6 }));

  // 7. Номер партії / замовлення (обов'язковий останній рядок)
  if (spec.orderNumber) lines.push({ kind: "text", text: spec.orderNumber, section: 7 });
  bySection(7).forEach((e) => lines.push({ kind: "text", text: `${e.label}: ${e.value}`, section: 7 }));

  if (format === "compact") {
    mergeTail(lines);
  }

  const text = lines.map((l) => l.text).join("\n");
  return { format, lines, marks, text };
}

function resolveMarks(spec: ProductSpec, profile: BrandProfile): string[] {
  const fromCerts = spec.certifications
    .map(canonicalMark)
    .filter((m) => VISUAL_MARKS.includes(m));
  if (fromCerts.length) return Array.from(new Set(fromCerts));
  return profile.baseMarks.map(canonicalMark).filter((m) => VISUAL_MARKS.includes(m));
}

function mergeTail(lines: PlanLine[]): void {
  const marksIdx = lines.findIndex((l) => l.kind === "symbols");
  if (marksIdx === -1) return;
  const tailIdx = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l, i }) => i > marksIdx && (l.section === 6 || l.section === 7) && l.kind === "text");
  if (!tailIdx.length) return;
  const tail = tailIdx.map(({ l }) => l.text).filter(Boolean);
  lines[marksIdx].text = `${lines[marksIdx].text} | ${tail.join(" | ")}`;
  for (let k = tailIdx.length - 1; k >= 0; k--) {
    lines.splice(tailIdx[k].i, 1);
  }
}

export function engravingTextForRules(
  spec: ProductSpec,
  profile: BrandProfile,
  format: EngravingFormat = "full",
): string {
  return buildEngravingPlan(spec, profile, { format }).text;
}
