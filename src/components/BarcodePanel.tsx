"use client";

import { useEffect, useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { buildBarcode, type BarcodeResult } from "@/lib/generate/barcode";
import { downloadText } from "@/lib/export";
import { Button, TextInput } from "./ui";

export function BarcodePanel() {
  const spec = useProjectStore((s) => s.spec);
  const updateSpec = useProjectStore((s) => s.updateSpec);
  const [result, setResult] = useState<BarcodeResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    buildBarcode(spec.ean13).then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, [spec.ean13]);

  const downloadPng = () => {
    if (!result?.pngDataUrl) return;
    const a = document.createElement("a");
    a.href = result.pngDataUrl;
    a.download = `${spec.model || "barcode"}.png`;
    a.click();
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <span className="field-label">EAN-13</span>
        <div className="mt-1 max-w-xs">
          <TextInput
            value={spec.ean13}
            onChange={(v) => updateSpec({ ean13: v.replace(/\D/g, "").slice(0, 13) })}
            placeholder="4820000000000"
          />
        </div>
        <p className="mt-1 text-[11px] text-slate-400">13 цифр. Контрольна цифра перевіряється автоматично.</p>
      </div>

      {result && !result.valid && spec.ean13 ? (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">{result.reason}</p>
      ) : null}

      {result?.valid ? (
        <>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => downloadText(result.svg, `${spec.model || "barcode"}.svg`, "image/svg+xml")}>
              Завантажити SVG (вектор)
            </Button>
            <Button size="sm" variant="secondary" onClick={downloadPng}>
              Завантажити PNG (600+ dpi)
            </Button>
          </div>
          <div className="svg-preview flex justify-center rounded-lg border border-[var(--border)] bg-white p-6">
            <div dangerouslySetInnerHTML={{ __html: result.svg }} />
          </div>
        </>
      ) : null}
    </div>
  );
}
