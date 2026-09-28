import type { Category, Language, ProductSpec } from "../types";

export interface AiResult {
  ok: boolean;
  bullets?: Record<string, string[]>;
  error?: string;
}

export function specSummary(spec: ProductSpec): string {
  const ports = spec.ports
    .map(
      (p) =>
        `${p.type} ${p.direction ?? "output"} ${p.outputs.map((o) => `${o.volts}V/${o.amps}A`).join(", ")} (${p.maxW}W) ${p.protocols.join("/")}`,
    )
    .join("; ");
  return [
    `Brand: ${spec.brand}`,
    `Category: ${spec.category}`,
    `Model: ${spec.model}`,
    `Product (UA): ${spec.productNameUk}`,
    `Total output: ${spec.totalOutputW}W`,
    `Input: ${spec.input.kind} ${spec.input.voltage}V`,
    `Ports: ${ports}`,
    spec.battery?.capacityMah ? `Battery: ${spec.battery.capacityMah}mAh ${spec.battery.wh ?? ""}Wh` : "",
    spec.material ? `Material: ${spec.material}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateBulletsAI(
  spec: ProductSpec,
  languages: Language[],
  apiKey: string,
  model = "gemini-2.0-flash",
): Promise<AiResult> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: specSummary(spec),
        category: spec.category as Category,
        languages,
        apiKey,
        model,
      }),
    });
    const data = (await res.json()) as AiResult;
    return data;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Помилка звернення до ШІ" };
  }
}
