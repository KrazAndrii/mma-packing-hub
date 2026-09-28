import { PROFILES } from "../src/lib/profiles";
import { buildEngravingPlan } from "../src/lib/generate/engravingPlan";

const profile = PROFILES[0];
const spec = structuredClone(profile.samples[0]);
console.log("--- FULL ---");
console.log(buildEngravingPlan(spec, profile, { format: "full" }).text);
console.log("\n--- COMPACT ---");
console.log(buildEngravingPlan(spec, profile, { format: "compact" }).text);
