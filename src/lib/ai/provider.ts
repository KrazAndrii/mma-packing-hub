import type { Language, ProductSpec } from "../types";

export interface AiResult<T> {
  ok: boolean;
  data?: T;
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
    `Category: ${spec.category}`,
    `Model: ${spec.model}`,
    `Total output: ${spec.totalOutputW}W`,
    `Input: ${spec.input.kind} ${spec.input.voltage}V`,
    `Ports: ${ports}`,
    spec.battery?.capacityMah ? `Battery: ${spec.battery.capacityMah}mAh ${spec.battery.wh ?? ""}Wh` : "",
    spec.driverSize ? `Driver: ${spec.driverSize}` : "",
    spec.audioCodecs ? `Codecs: ${spec.audioCodecs}` : "",
    spec.magneticForce ? `Magnets: ${spec.magneticForce}` : "",
    spec.technologies.length ? `Technologies: ${spec.technologies.join(", ")}` : "",
    spec.material ? `Material: ${spec.material}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function post<T>(body: Record<string, unknown>): Promise<AiResult<T>> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { ok: boolean; data?: T; error?: string };
    return data;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Помилка звернення до ШІ" };
  }
}

export function aiUtp(
  spec: ProductSpec,
  apiKey: string,
  model: string,
): Promise<AiResult<string[]>> {
  return post<string[]>({ action: "utp", summary: specSummary(spec), apiKey, model });
}

export function aiParseSpec(
  rawSpec: string,
  apiKey: string,
  model: string,
): Promise<AiResult<Record<string, unknown>>> {
  return post<Record<string, unknown>>({ action: "parse", rawSpec, apiKey, model });
}

export function aiTranslateBullets(
  bullets: string[],
  languages: Language[],
  apiKey: string,
  model: string,
): Promise<AiResult<Record<string, string[]>>> {
  return post<Record<string, string[]>>({ action: "translate", bullets, languages, apiKey, model });
}
