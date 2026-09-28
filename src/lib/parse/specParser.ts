import type { ExtraSpec, InputSpec, PortOutput, PortSpec, ProductSpec } from "../types";

export type Confidence = "high" | "medium" | "low";

export interface RecognizedField {
  key: string;
  label: string;
  value: string;
  confidence: Confidence;
}

export interface ParseOutput {
  patch: Partial<ProductSpec>;
  extras: ExtraSpec[];
  ports: PortSpec[];
  detectedCategory?: string;
  warnings: string[];
  unknownLines: string[];
  recognized: RecognizedField[];
  rawLines: string[];
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  azu: ["car charger", "автомобильн", "прикуривател", "12-24v", "car-charger", "car charger"],
  szu: ["wall charger", "ac input", "100-240", "network charger", "сетевое", "мережев"],
  bzu: ["wireless", "magsafe", "магнит", "magnet", "индукц", "induction", "qi2", "qi 2", "qi2.2", "бездротов"],
  power_bank: ["power bank", "powerbank", "павербанк", "battery capacity", "ёмкость", "ємність", "портативн"],
  tws: ["tws", "earbuds", "наушник", "earphone", "bluetooth version", "driver", "драйвер", "кейс", "case"],
  wired: ["wired", "проводные наушник", "3.5mm", "jack"],
  usb_hub: ["hub", "hdmi", "rj45", "usb hub", "концентратор", "4k@"],
  smart_watch: ["smart watch", "smartwatch", "смарт-годинник", " smart watch"],
  car_holder: ["holder", "suction", "держател", "ball joint", "car mount"],
  cable: ["data transfer", "type-c to", "cable length", "кабель usb", "usb кабель"],
};

function normalize(text: string): string {
  return text
    .replace(/\uFEFF/g, "")
    .replace(/[：]/g, ":")
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")")
    .replace(/[／]/g, "/")
    .replace(/[–—−]/g, "-")
    .replace(/[，]/g, ",")
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "");
}

function num(value: string): number {
  return Number(String(value).replace(",", "."));
}

function splitLabel(line: string): { label: string; value: string } | null {
  const idx = line.indexOf(":");
  if (idx === -1) return null;
  const label = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim();
  if (!label || !value) return null;
  return { label, value };
}

const PORT_RE = /(usb[\s-]?c|usb[\s-]?a|micro[\s-]?usb|lightning|iP|type[\s-]?c|dc|hdmi|rj45)/i;
const MAH_RE = /(\d+(?:\.\d+)?)\s*(?:mah|м[аa]ч)/i;

function detectPortType(label: string): string {
  const l = label.toLowerCase();
  if (/usb[\s-]?c|type[\s-]?c/.test(l)) return "USB-C";
  if (/usb[\s-]?a/.test(l)) return "USB-A";
  if (/micro/.test(l)) return "Micro-USB";
  if (/lightning|\bip\b|\bip /.test(l)) return "iP";
  if (/hdmi/.test(l)) return "HDMI";
  if (/rj45/.test(l)) return "RJ45";
  if (/dc/.test(l)) return "DC";
  return label.trim();
}

function normVolts(value: string): string {
  // 100V-240V -> 100-240V
  return value.replace(/(\d)\s*V\s*-\s*/gi, "$1-");
}

function parseVA(value: string): PortOutput[] {
  const out: PortOutput[] = [];
  const re = /(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)\s*V\s*\/\s*(\d+(?:\.\d+)?)\s*A/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(value)) !== null) {
    out.push({ volts: m[1].replace(/\s/g, ""), amps: m[2] });
  }
  return out;
}

function parseMaxW(value: string): number {
  const m = /(\d+(?:\.\d+)?)\s*W/i.exec(value);
  return m ? num(m[1]) : 0;
}

function parsePort(label: string, value: string): PortSpec | null {
  const outputs = parseVA(value);
  const isPps = /pps/i.test(label);
  const maxW = parseMaxW(value);
  if (!outputs.length) return null;
  return {
    id: `port-${Math.random().toString(36).slice(2, 8)}`,
    type: detectPortType(label) || "USB",
    protocols: [],
    outputs,
    maxW,
    direction: /input|вход|вхід/i.test(label) ? "input" : "output",
    label: isPps ? "PPS" : undefined,
  };
}

export function parseSpecText(raw: string): ParseOutput {
  const text = normalize(raw);
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const patch: Partial<ProductSpec> = {};
  const extras: ExtraSpec[] = [];
  const ports: PortSpec[] = [];
  const recognized: RecognizedField[] = [];
  const unknownLines: string[] = [];
  const warnings: string[] = [];

  const add = (key: string, label: string, value: string, confidence: Confidence) =>
    recognized.push({ key, label, value, confidence });

  const technologies: string[] = [];
  let batteryCapacity: number | undefined;
  let batteryVoltage: number | undefined;
  let batteryWh: number | undefined;
  let input: InputSpec | undefined;
  let detectedCategory: string | undefined;

  for (const line of lines) {
    const lv = line.toLowerCase();
    const kv = splitLabel(line);
    const value = kv?.value ?? line;
    const label = kv?.label ?? "";
    const labelLower = label.toLowerCase();

    if (/^(model|модель|артикул)\b/.test(lv) && !/чипсет|chipset/.test(lv) && !patch.model) {
      patch.model = value;
      add("model", label || "Model", value, "high");
      continue;
    }

    if (/total\s*output|загальн\w*\s*потуж|общ\w*\s*мощн/.test(lv)) {
      const w = parseMaxW(value);
      if (w) patch.totalOutputW = w;
      add("totalOutputW", label, w ? `${w} W` : value, w ? "high" : "medium");
      continue;
    }

    // Battery capacity (earbud / device)
    if (/battery capacity|ёмкост|ємніст|емкость/.test(lv) || MAH_RE.test(value)) {
      const mAh = MAH_RE.exec(value);
      const wh = /(\d+(?:\.\d+)?)\s*wh/i.exec(value);
      const v = /(\d+(?:\.\d+)?)\s*v\b/i.exec(value);
      const isCase = /кейс|case/.test(lv);
      if (mAh) {
        if (isCase) {
          extras.push({ label: "Battery (case)", value: `${num(mAh[1])} mAh`, section: 1 });
        } else if (!batteryCapacity) {
          batteryCapacity = num(mAh[1]);
        } else {
          extras.push({ label: label || "Battery", value: value, section: 1 });
        }
      }
      if (wh) batteryWh = num(wh[1]);
      if (v && !batteryVoltage) batteryVoltage = num(v[1]);
      add("battery", label || "Battery", value, mAh ? "high" : "medium");
      continue;
    }

    if (/conversion|ккд|кпд|efficiency/.test(lv)) {
      const p = /(\d+(?:\.\d+)?)\s*%/.exec(value);
      if (p) patch.conversionRate = num(p[1]);
      add("conversionRate", label, value, p ? "high" : "medium");
      continue;
    }

    // Input
    if (
      /^(ac\s*input|input|вход|вхід|вхідна|входное)/.test(lv) &&
      !/output|выход|вихід/.test(lv)
    ) {
      const vnorm = normVolts(value);
      const isAC = /ac|100-240|50\s*[-/]?\s*60|hz/i.test(value);
      const volts = /(\d+(?:\s*-\s*\d+)?)\s*V/i.exec(vnorm);
      const amps = /(\d+(?:\.\d+)?)\s*A\b/i.exec(value.replace(/\d+(?:\.\d+)?\s*V/gi, ""));
      const hz = /(\d+(?:\s*[-/]\s*\d+)?)\s*Hz/i.exec(value);
      const w = parseMaxW(value);
      input = {
        kind: isAC ? "AC" : "DC",
        voltage: volts ? volts[1].replace(/\s/g, "") : "",
        current: amps ? amps[1] : undefined,
        frequency: hz ? hz[1].replace(/\s/g, "") : undefined,
        maxW: w || undefined,
      };
      add("input", label || "Input", value, volts ? "high" : "medium");
      continue;
    }

    // Output / ports
    if (
      (/output|выход|вихід|input|вход|вхід/.test(lv) || PORT_RE.test(label)) &&
      /v\s*\/\s*\d/i.test(value)
    ) {
      const port = parsePort(label || "Output", value);
      if (port) {
        ports.push(port);
        add(`port:${port.type}`, label, value, "high");
        continue;
      }
    }

    // Bare "Output: 25W (Max)" -> total output (wireless chargers)
    if (/^(output|выход|вихід)$/.test(labelLower) && /w/i.test(value) && !/v\s*\//i.test(value)) {
      const w = parseMaxW(value);
      if (w && !patch.totalOutputW) patch.totalOutputW = w;
      add("totalOutputW", label, w ? `${w} W` : value, w ? "high" : "medium");
      continue;
    }

    // Certificate (label-based, so marketing lines with "Certified" are not mistaken)
    if (/certificate|certif|сертифик|сертифік|сертифікат/.test(labelLower)) {
      const certs = value
        .split(/[,;/]+/)
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => (c.toLowerCase() === "rohs" ? "RoHS" : c.toUpperCase() === "CE" ? "CE" : c));
      if (certs.length) patch.certifications = certs;
      add("certifications", label, value, "high");
      continue;
    }

    if (/bluetooth version|версия bluetooth/.test(lv)) {
      technologies.push(value.replace(/^v/i, "BT ").trim());
      add("bluetooth", label, value, "high");
      continue;
    }
    if (/codec|кодек/.test(lv)) {
      patch.audioCodecs = value;
      add("audioCodecs", label, value, "high");
      continue;
    }
    if (labelLower.includes("qi") || /^qi2?\.?\d?$/.test(labelLower) || /qi2?\.?\d?\s*certified/i.test(value)) {
      const qi = /qi2?\.?\d?/i.exec(value + " " + label);
      if (qi) technologies.push(qi[0].toUpperCase());
      add("qi", label || "Qi", value, "high");
      continue;
    }
    if (/protocol|протокол/.test(lv)) {
      technologies.push(value);
      add("protocols", label, value, "medium");
      continue;
    }

    if (/material|материал/.test(lv)) {
      patch.material = value;
      add("material", label, value, "high");
      continue;
    }
    if (/magnet|магнит|n\d{2}\b/.test(labelLower) || /n\d{2}\b/.test(value)) {
      const n = /N\d+/i.exec(value);
      if (n) patch.magneticForce = n[0].toUpperCase();
      else if (!patch.magneticForce) patch.magneticForce = value;
      add("magnets", label, value, "high");
      continue;
    }
    if (/driver|динамик|драйвер|ø|dia/.test(lv)) {
      patch.driverSize = value;
      add("driverSize", label, value, "high");
      continue;
    }
    if (/impedance|импеданс|сопротивлен/.test(lv)) {
      extras.push({ label: "Impedance", value, section: 1 });
      add("impedance", label, value, "high");
      continue;
    }
    if (/dimension|размер|габарит/.test(lv) || /\d+\s*\*\s*\d+\s*\*\s*\d+/.test(value)) {
      const m = /(\d+(?:\.\d+)?)\s*[*x×]\s*(\d+(?:\.\d+)?)\s*[*x×]\s*(\d+(?:\.\d+)?)/i.exec(value);
      if (m) patch.dimensions = { length: num(m[1]), width: num(m[2]), height: num(m[3]) };
      add("dimensions", label, value, m ? "high" : "medium");
      continue;
    }
    if (/weight|вес|вага/.test(lv)) {
      const m = /(\d+(?:\.\d+)?)\s*g/i.exec(value);
      if (m) patch.weightG = num(m[1]);
      add("weight", label, value, m ? "high" : "medium");
      continue;
    }

    unknownLines.push(line);
    if (kv) extras.push({ label: kv.label, value: kv.value, section: 1 });
    else extras.push({ label: "Spec", value: line, section: 1 });
  }

  let best = "";
  let bestScore = 0;
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[cat] = words.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0);
  }
  // Сигнали, що сильно визначають категорію
  if (MAH_RE.test(text) || /battery capacity|ёмкост|ємніст/.test(lower)) scores.power_bank = (scores.power_bank ?? 0) + 3;
  if (/bluetooth version|earbuds|наушник|tws/.test(lower)) scores.tws = (scores.tws ?? 0) + 3;
  if (/qi2?\.?\d?|wireless|magsafe|magnet|магнит/.test(lower)) scores.bzu = (scores.bzu ?? 0) + 3;
  if (/hdmi|rj45|usb hub|концентратор/.test(lower)) scores.usb_hub = (scores.usb_hub ?? 0) + 3;

  for (const [cat, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  }
  if (best && bestScore >= 1) detectedCategory = best;

  const sumPorts = ports.filter((p) => p.direction !== "input").reduce((a, p) => a + p.maxW, 0);
  const declared = patch.totalOutputW ?? 0;
  if (declared && sumPorts && declared > sumPorts + 0.05) {
    warnings.push(
      `Сума портів (${sumPorts} W) менша за Total Output (${declared} W) — перевірте специфікацію фабрики.`,
    );
  }

  if (batteryCapacity) patch.battery = { capacityMah: batteryCapacity, voltage: batteryVoltage, wh: batteryWh };
  if (input) patch.input = input;
  if (technologies.length) patch.technologies = Array.from(new Set(technologies));
  if (ports.length) patch.ports = ports;
  if (extras.length) patch.extraSpecs = extras;

  return { patch, extras, ports, detectedCategory, warnings, unknownLines, recognized, rawLines: lines };
}
