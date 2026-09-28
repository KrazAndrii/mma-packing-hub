import type { ProductSpec } from "./types";
import { trimNum } from "./generate/specs";

function words(value: string): string[] {
  return value.split(/\s+/).filter(Boolean);
}

export function buildUtpBadges(spec: ProductSpec): string[] {
  const badges: string[] = [];

  if (spec.totalOutputW) {
    badges.push(`${trimNum(spec.totalOutputW)}W Fast Charge`);
  }

  const protocols = Array.from(new Set(spec.ports.flatMap((p) => p.protocols))).filter(Boolean);
  for (const proto of protocols.slice(0, 2)) {
    badges.push(proto.replace(/\s*d([0-9])/i, (m) => m.toUpperCase()));
  }

  if (spec.technologies.some((t) => /qi/i.test(t))) {
    const qi = spec.technologies.find((t) => /qi/i.test(t))!;
    badges.push(`${qi} Certified`);
  }

  if (spec.magneticForce) {
    const m = /N\d+/i.exec(spec.magneticForce);
    badges.push(m ? `${m[0].toUpperCase()} Magnets` : "Strong Magnets");
    badges.push("Magnetic Mount");
  }

  if (spec.battery?.capacityMah) {
    badges.push(`${trimNum(spec.battery.capacityMah)}mAh Battery`);
  }

  if (spec.driverSize) {
    badges.push(`${spec.driverSize} Drivers`);
  }
  if (spec.audioCodecs) {
    badges.push(`${spec.audioCodecs} Codec`);
  }
  if (spec.dataTransfer) {
    badges.push(`${spec.dataTransfer} Data`);
  }
  if (spec.conversionRate) {
    badges.push(`≥${trimNum(spec.conversionRate)}% Efficiency`);
  } else if (spec.battery?.capacityMah) {
    badges.push("High Efficiency");
  }

  const outputs = spec.ports.filter((p) => p.direction !== "input");
  if (outputs.length > 1) badges.push("Multi Port");

  if (spec.wireless) badges.push("Wireless Ready");

  if (spec.weightG && spec.weightG <= 120) badges.push("Ultra Compact");

  const unique: string[] = [];
  for (const b of badges) {
    const trimmed = words(b).length <= 3 ? b : words(b).slice(0, 3).join(" ");
    if (!unique.includes(trimmed)) unique.push(trimmed);
  }

  if (unique.length < 3) {
    const fillers = ["Fast Charging", "Smart Protection", "Durable Design", "Easy To Use"];
    for (const f of fillers) {
      if (unique.length >= 3) break;
      if (!unique.includes(f)) unique.push(f);
    }
  }

  return unique.slice(0, 5);
}
