import fs from "node:fs";
import path from "node:path";
import { PROFILES } from "../src/lib/profiles";
import { buildEngraving } from "../src/lib/generate/engraving";

const originalFetch = globalThis.fetch;

globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url.includes("/fonts/")) {
    const file = url.split("/fonts/")[1];
    const buf = fs.readFileSync(path.join(process.cwd(), "public", "fonts", file));
    return new Response(buf, { status: 200 });
  }
  return originalFetch(input, init);
}) as typeof fetch;

async function main() {
  const profile = PROFILES[0];
  const spec = structuredClone(profile.samples[0]);

  for (const format of ["full", "compact"] as const) {
    const res = await buildEngraving(spec, profile, { format });
    console.log(`\n[${format}] SVG ${res.svg.length} chars, ${res.widthMm}x${res.heightMm} mm`);
    console.log(`  <path> tags: ${(res.svg.match(/<path/g) || []).length}`);
    console.log(`[${format}] DXF ${res.dxf.length} chars, sections: ${(res.dxf.match(/SECTION/g) || []).length}`);
    console.log(`  SVG head: ${res.svg.replace(/\n/g, " ").slice(0, 160)}`);
    console.log(`  DXF head: ${res.dxf.split("\n").slice(0, 6).join(" | ")}`);
  }
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
