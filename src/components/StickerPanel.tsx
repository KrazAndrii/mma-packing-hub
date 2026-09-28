"use client";

import { useProjectStore } from "@/store/useProjectStore";
import { getProfile } from "@/lib/profiles";
import { buildSticker } from "@/lib/generate/sticker";
import { downloadText } from "@/lib/export";
import { Button } from "./ui";

const STATUS_STYLES: Record<string, string> = {
  replace: "text-red-600",
  adapt: "text-orange-600",
  verify: "text-purple-600",
};

export function StickerPanel() {
  const spec = useProjectStore((s) => s.spec);
  const profileId = useProjectStore((s) => s.profileId);
  const profile = getProfile(profileId);
  const sticker = buildSticker(spec, profile);

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-3 text-[11px]">
          <span className="text-red-600">● замінити</span>
          <span className="text-orange-600">● адаптувати</span>
          <span className="text-purple-600">● уточнити у ВЕД/юриста</span>
        </div>
        <Button size="sm" variant="secondary" onClick={() => downloadText(sticker.text, `${spec.model || "sticker"}-uk.txt`)}>
          Завантажити .txt
        </Button>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white p-5">
        <h2 className="mb-4 text-lg font-bold tracking-tight text-slate-900">{sticker.title}</h2>
        <div className="space-y-3 text-[13px] leading-relaxed">
          {sticker.blocks.map((b, i) => (
            <p key={i} className={b.status ? STATUS_STYLES[b.status] : "text-slate-800"}>
              {b.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
