import { ean13Checksum } from "../rules/engine";

export interface BarcodeResult {
  valid: boolean;
  reason?: string;
  svg: string;
  pngDataUrl: string;
  ean: string;
}

interface BwipOptions {
  bcid: string;
  text: string;
  scale?: number;
  height?: number;
  includetext?: boolean;
  textxalign?: string;
  textsize?: number;
  backgroundcolor?: string;
}

interface BwipBrowser {
  toSVG(opts: BwipOptions): string;
  toCanvas(canvas: HTMLCanvasElement | string, opts: BwipOptions): void;
}

let bwipPromise: Promise<BwipBrowser> | null = null;

async function loadBwip(): Promise<BwipBrowser> {
  if (!bwipPromise) {
    bwipPromise = import("bwip-js/browser").then((m) => {
      const mod = m as unknown as { default?: BwipBrowser } & BwipBrowser;
      return mod.default ?? mod;
    });
  }
  return bwipPromise;
}

export async function buildBarcode(ean: string): Promise<BarcodeResult> {
  const clean = (ean || "").replace(/\D/g, "");
  const check = ean13Checksum(clean);
  if (!check.valid) {
    return { valid: false, reason: check.reason ?? "Некоректний EAN-13", svg: "", pngDataUrl: "", ean: clean };
  }

  const bwipjs = await loadBwip();
  const opts: BwipOptions = {
    bcid: "ean13",
    text: clean,
    scale: 3,
    height: 22,
    includetext: true,
    textxalign: "center",
    textsize: 10,
    backgroundcolor: "FFFFFF",
  };

  const svg = bwipjs.toSVG(opts);

  let pngDataUrl = "";
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    bwipjs.toCanvas(canvas, { ...opts, scale: 6 });
    pngDataUrl = canvas.toDataURL("image/png");
  }

  return { valid: true, svg, pngDataUrl, ean: clean };
}
