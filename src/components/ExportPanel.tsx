"use client";

import { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { getProfile } from "@/lib/profiles";
import { buildEngraving } from "@/lib/generate/engraving";
import { buildEngravingPlan } from "@/lib/generate/engravingPlan";
import { buildBarcode } from "@/lib/generate/barcode";
import { buildSticker } from "@/lib/generate/sticker";
import { buildAllMarketing, buildSpecTranslations } from "@/lib/i18n/translate";
import { buildExportZip, downloadBlob } from "@/lib/export";
import { Button, Card } from "./ui";

export function ExportPanel() {
  const spec = useProjectStore((s) => s.spec);
  const profileId = useProjectStore((s) => s.profileId);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const profile = getProfile(profileId);

  const buildAll = async () => {
    setBusy(true);
    setMessage("Генерація пакета…");
    try {
      const [full, compact] = await Promise.all([
        buildEngraving(spec, profile, { format: "full" }),
        buildEngraving(spec, profile, { format: "compact" }),
      ]);
      const barcode = await buildBarcode(spec.ean13);
      const sticker = buildSticker(spec, profile);
      const blob = await buildExportZip({
        spec,
        profileName: profile.name,
        engravingFullSvg: full.svg,
        engravingFullDxf: full.dxf,
        engravingCompactSvg: compact.svg,
        engravingCompactDxf: compact.dxf,
        engravingTextFull: buildEngravingPlan(spec, profile, "full").text,
        stickerText: sticker.text,
        barcodeSvg: barcode.valid ? barcode.svg : "",
        barcodePngDataUrl: barcode.valid ? barcode.pngDataUrl : "",
        translations: buildSpecTranslations(spec, spec.languages),
        marketing: buildAllMarketing(spec, spec.languages),
      });
      downloadBlob(blob, `${profile.name}_${spec.model || "product"}.zip`);
      setMessage("Пакет завантажено.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Помилка формування пакета");
    } finally {
      setBusy(false);
    }
  };

  const items = [
    "Гравіювання SVG/DXF (повний + компактний режими)",
    "Текст гравіювання за стандартом",
    "Стікер (КМ) — юридичний текст UA",
    "Штрихкод EAN-13 (SVG + PNG)",
    "Переклади 6 мов (спеки)",
    "Маркетингові буллети",
    "spec.json — усі дані",
  ];

  return (
    <div className="space-y-4 p-4">
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-slate-800">Повний пакет одним файлом</h3>
        <p className="mt-1 text-xs text-slate-500">
          Один ZIP з усіма артефактами для передачі дизайнеру, техвідділу та ВЕД.
        </p>
        <ul className="mt-3 space-y-1 text-xs text-slate-600">
          {items.map((it) => (
            <li key={it}>• {it}</li>
          ))}
        </ul>
        <div className="mt-4">
          <Button onClick={buildAll} disabled={busy}>
            {busy ? "Формування…" : "Сформувати пакет (ZIP)"}
          </Button>
        </div>
        {message ? <p className="mt-2 text-xs text-slate-600">{message}</p> : null}
      </Card>
    </div>
  );
}
