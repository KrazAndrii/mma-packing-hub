import JSZip from "jszip";
import type { ProductSpec } from "./types";
import type { SpecLine } from "./generate/specs";
import { specLinesToText } from "./i18n/translate";

export interface ExportBundle {
  spec: ProductSpec;
  profileName: string;
  engravingFullSvg: string;
  engravingFullDxf: string;
  engravingCompactSvg: string;
  engravingCompactDxf: string;
  engravingTextFull: string;
  stickerText: string;
  barcodeSvg: string;
  barcodePngDataUrl: string;
  translations: Record<string, SpecLine[]>;
  marketing: Record<string, string[]>;
}

function dataUrlToUint8(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function buildExportZip(bundle: ExportBundle): Promise<Blob> {
  const zip = new JSZip();
  const folderName = `${bundle.spec.brand}_${bundle.spec.model || "product"}`.replace(/[^\w.-]+/g, "_");
  const root = zip.folder(folderName) ?? zip;

  root.file("gravure-full.svg", bundle.engravingFullSvg);
  root.file("gravure-full.dxf", bundle.engravingFullDxf);
  root.file("gravure-compact.svg", bundle.engravingCompactSvg);
  root.file("gravure-compact.dxf", bundle.engravingCompactDxf);
  root.file("gravure-text.txt", bundle.engravingTextFull);
  root.file("sticker-uk.txt", bundle.stickerText);
  if (bundle.barcodeSvg) root.file("barcode.svg", bundle.barcodeSvg);
  if (bundle.barcodePngDataUrl) root.file("barcode.png", dataUrlToUint8(bundle.barcodePngDataUrl));

  const trSections = Object.entries(bundle.translations)
    .map(([lang, lines]) => `## ${lang}\n\n${specLinesToText(lines)}`)
    .join("\n\n");
  root.file("translations.md", trSections || "# Немає перекладів");

  const mkSections = Object.entries(bundle.marketing)
    .map(([lang, bullets]) => `## ${lang}\n\n${bullets.map((b) => `- ${b}`).join("\n")}`)
    .join("\n\n");
  root.file("marketing.md", mkSections || "# Немає буллетів");

  root.file("spec.json", JSON.stringify({ profile: bundle.profileName, spec: bundle.spec }, null, 2));

  return zip.generateAsync({ type: "blob" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadText(text: string, filename: string, type = "text/plain;charset=utf-8"): void {
  downloadBlob(new Blob([text], { type }), filename);
}
