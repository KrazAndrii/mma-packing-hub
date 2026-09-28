import type { EngravingFormat, EngravingResult, ProductSpec } from "../types";
import type { BrandProfile } from "../profiles";
import { buildEngravingPlan } from "./engravingPlan";

interface OtPath {
  toPathData(precision?: number): string;
}
interface OtFont {
  getPath(text: string, x: number, y: number, fontSize: number): OtPath;
  getAdvanceWidth(text: string, fontSize: number): number;
}

const fontCache = new Map<string, Promise<OtFont>>();

function fontFile(weight: BrandProfile["engravingFont"]): string {
  if (weight === "bold") return "Roboto-Bold.woff";
  if (weight === "medium") return "Roboto-Medium.woff";
  return "Roboto-Regular.woff";
}

async function loadFont(weight: BrandProfile["engravingFont"]): Promise<OtFont> {
  const file = fontFile(weight);
  let promise = fontCache.get(file);
  if (!promise) {
    promise = (async () => {
      const mod = await import("opentype.js");
      const ot = ((mod as unknown as { default?: unknown }).default ?? mod) as {
        parse(b: ArrayBuffer): OtFont;
      };
      const res = await fetch(`/fonts/${file}`);
      const buf = await res.arrayBuffer();
      return ot.parse(buf);
    })();
    fontCache.set(file, promise);
  }
  return promise;
}

function circleD(cx: number, cy: number, r: number): string {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
}

function lineD(x1: number, y1: number, x2: number, y2: number): string {
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

interface SymbolDraw {
  d: string;
  width: number;
}

function textSymbol(font: OtFont, text: string, x: number, y: number, size: number): SymbolDraw {
  const fs = size * 0.42;
  const width = font.getAdvanceWidth(text, fs);
  const d = font.getPath(text, x, y + size * 0.72, fs).toPathData(3);
  return { d, width };
}

function symbolDraw(font: OtFont, name: string, x: number, y: number, s: number): SymbolDraw {
  switch (name) {
    case "BIN":
      return {
        width: s,
        d: [
          lineD(x, y + 0.15 * s, x + s, y + 0.15 * s),
          `M ${x + 0.35 * s} ${y + 0.15 * s} V ${y + 0.05 * s} H ${x + 0.65 * s} V ${y + 0.15 * s}`,
          `M ${x + 0.18 * s} ${y + 0.15 * s} H ${x + 0.82 * s} V ${y + 0.9 * s} H ${x + 0.18 * s} Z`,
          lineD(x + 0.12 * s, y + 0.1 * s, x + 0.88 * s, y + 0.95 * s),
          lineD(x + 0.88 * s, y + 0.1 * s, x + 0.12 * s, y + 0.95 * s),
        ].join(" "),
      };
    case "TREFOIL":
      return {
        width: s,
        d: [
          `M ${x + 0.5 * s} ${y + 0.08 * s} L ${x + 0.92 * s} ${y + 0.84 * s} L ${x + 0.08 * s} ${y + 0.84 * s} Z`,
          `M ${x + 0.5 * s} ${y + 0.3 * s} L ${x + 0.74 * s} ${y + 0.7 * s} L ${x + 0.26 * s} ${y + 0.7 * s} Z`,
          circleD(x + 0.5 * s, y + 0.55 * s, 0.05 * s),
        ].join(" "),
      };
    case "MOBIUS":
      return {
        width: s,
        d: [
          circleD(x + 0.5 * s, y + 0.5 * s, 0.42 * s),
          `M ${x + 0.5 * s} ${y + 0.2 * s} L ${x + 0.72 * s} ${y + 0.5 * s} L ${x + 0.5 * s} ${y + 0.8 * s} L ${x + 0.28 * s} ${y + 0.5 * s} Z`,
        ].join(" "),
      };
    case "CE":
      return textSymbol(font, "CE", x, y, s * 0.95);
    case "RoHS":
      return textSymbol(font, "RoHS", x, y, s * 0.78);
    case "EAC":
      return textSymbol(font, "EAC", x, y, s * 0.9);
    case "FCC":
      return textSymbol(font, "FCC", x, y, s * 0.9);
    default:
      return textSymbol(font, name, x, y, s * 0.8);
  }
}

export interface EngravingOptions {
  format?: EngravingFormat;
  fontSize?: number;
  lineHeight?: number;
  margin?: number;
  symbolSize?: number;
  maxWidth?: number;
}

export async function buildEngraving(
  spec: ProductSpec,
  profile: BrandProfile,
  options: EngravingOptions = {},
): Promise<EngravingResult> {
  const font = await loadFont(profile.engravingFont);
  const fontSize = options.fontSize ?? 2.6;
  const lineHeight = options.lineHeight ?? 3.4;
  const margin = options.margin ?? 2.5;
  const symbolSize = options.symbolSize ?? 3.4;
  const maxWidth = options.maxWidth ?? 48;

  const plan = buildEngravingPlan(spec, profile, options.format ?? "full");
  const textParts: string[] = [];
  const symbolParts: string[] = [];
  let y = margin + fontSize;
  let contentWidth = 0;

  for (const line of plan.lines) {
    if (line.kind === "symbols") {
      const marks = line.marks ?? [];
      let sx = margin;
      for (const mark of marks) {
        const draw = symbolDraw(font, mark, sx, y - fontSize * 0.85, symbolSize);
        if (sx + draw.width > margin + maxWidth && sx > margin) {
          sx = margin;
          y += symbolSize + 1.4;
          const wrapped = symbolDraw(font, mark, sx, y - fontSize * 0.85, symbolSize);
          symbolParts.push(wrapped.d);
          sx += wrapped.width + 1.6;
          contentWidth = Math.max(contentWidth, sx);
          continue;
        }
        symbolParts.push(draw.d);
        sx += draw.width + 1.6;
        contentWidth = Math.max(contentWidth, sx);
      }
      y += symbolSize + 1.6;
      continue;
    }

    const d = font.getPath(line.text, margin, y, fontSize).toPathData(3);
    textParts.push(d);
    contentWidth = Math.max(contentWidth, font.getAdvanceWidth(line.text, fontSize));
    y += lineHeight;
  }

  const widthMm = Math.ceil(Math.max(contentWidth + margin * 2, 30));
  const heightMm = Math.ceil(y + margin);

  const svg = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${heightMm}mm" viewBox="0 0 ${widthMm} ${heightMm}">`,
    `<title>${escapeXml(spec.brand)} ${escapeXml(spec.model)} — engraving (${plan.format})</title>`,
    `<g fill="#000000" stroke="none">`,
    ...textParts.map((d) => `<path d="${d}"/>`),
    `</g>`,
    `<g fill="none" stroke="#000000" stroke-width="0.18" stroke-linejoin="round" stroke-linecap="round">`,
    ...symbolParts.map((d) => `<path d="${d}"/>`),
    `</g>`,
    `</svg>`,
  ].join("\n");

  const dxf = await buildDxf([...textParts, ...symbolParts], widthMm, heightMm);

  return { lines: [], symbols: plan.marks, svg, dxf, widthMm, heightMm };
}

async function buildDxf(parts: string[], widthMm: number, heightMm: number): Promise<string> {
  const mod = await import("makerjs");
  const makerjs = ((mod as unknown as { default?: unknown }).default ?? mod) as {
    importer: { fromSVGPathData(d: string, opts?: { bezierAccuracy?: number }): unknown };
    model: {
      mirror(m: MakerJs.IModel, mirrorX: boolean, mirrorY: boolean): MakerJs.IModel;
      move(m: MakerJs.IModel, origin: [number, number]): MakerJs.IModel;
    };
    exporter: { toDXF(m: MakerJs.IModel, opts?: { units?: unknown }): string };
    unitType: { Millimeter: unknown };
  };
  const model: MakerJs.IModel = { models: {} };
  parts.forEach((d, i) => {
    try {
      const sub = makerjs.importer.fromSVGPathData(d, { bezierAccuracy: 0.05 }) as MakerJs.IModel;
      if (!model.models) model.models = {};
      model.models[`p${i}`] = sub;
    } catch {
      // skip malformed path
    }
  });
  const mirrored = makerjs.model.mirror(model, false, true);
  makerjs.model.move(mirrored, [0, heightMm]);
  return makerjs.exporter.toDXF(mirrored, { units: makerjs.unitType.Millimeter });
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string,
  );
}
