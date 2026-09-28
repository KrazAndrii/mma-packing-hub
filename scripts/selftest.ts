import { PROFILES } from "../src/lib/profiles";
import { buildEngravingPlan } from "../src/lib/generate/engravingPlan";
import { buildSpecLines } from "../src/lib/generate/specs";
import { buildSticker } from "../src/lib/generate/sticker";
import { runRules, ean13Checksum } from "../src/lib/rules/engine";
import { specLinesToText, buildMarketingBullets } from "../src/lib/i18n/translate";

const profile = PROFILES[0];
const spec = structuredClone(profile.samples[0]);

console.log("=== ENGRAVING (full) ===");
console.log(buildEngravingPlan(spec, profile, "full").text);
console.log("\n=== ENGRAVING (compact) ===");
console.log(buildEngravingPlan(spec, profile, "compact").text);
console.log("\n=== SPECS (UA) ===");
console.log(specLinesToText(buildSpecLines(spec, "UA")));
console.log("\n=== STICKER (UA, перші 400 символів) ===");
console.log(buildSticker(spec, profile).text.slice(0, 400));
console.log("\n=== COMPLIANCE ===");
for (const r of runRules(spec, profile.rules)) {
  console.log(`${r.passed ? "OK " : "!! "} ${r.title}${r.details?.length ? " — " + r.details.join("; ") : ""}`);
}
console.log("\n=== MARKETING (UA) ===");
console.log(buildMarketingBullets(spec, "UA").join("\n"));
console.log("\n=== EAN checksum test ===");
console.log("4820000000000:", ean13Checksum("4820000000000"));
console.log("4006381333931:", ean13Checksum("4006381333931"));
