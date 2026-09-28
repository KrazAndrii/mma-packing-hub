import type { ProductSpec } from "../types";
import type { BrandProfile } from "../profiles";
import type { Rule, RuleResult } from "./types";
import { buildEngravingPlan } from "../generate/engravingPlan";

export function ean13Checksum(ean: string): { valid: boolean; expected: string; reason?: string } {
  const clean = (ean || "").replace(/\D/g, "");
  if (clean.length !== 13) {
    return { valid: false, expected: "", reason: "EAN-13 має містити рівно 13 цифр" };
  }
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(clean[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const expected = String((10 - (sum % 10)) % 10);
  const actual = clean[12];
  if (expected !== actual) {
    return { valid: false, expected, reason: `Контрольна цифра має бути ${expected}, вказано ${actual}` };
  }
  return { valid: true, expected };
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function isBlank(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "number") return Number.isNaN(value);
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).every((v) => isBlank(v));
  }
  return false;
}

function applies(rule: Rule, spec: ProductSpec): boolean {
  if (!rule.enabled) return false;
  if (rule.categories === "all") return true;
  return rule.categories.includes(spec.category);
}

export function runRules(spec: ProductSpec, rules: Rule[], profile?: BrandProfile): RuleResult[] {
  return rules.filter((r) => applies(r, spec)).map((rule) => evaluate(rule, spec, profile));
}

function pass(rule: Rule): RuleResult {
  return { ruleId: rule.id, title: rule.title, severity: rule.severity, passed: true, message: "OK" };
}

function fail(rule: Rule, details?: string[]): RuleResult {
  return {
    ruleId: rule.id,
    title: rule.title,
    severity: rule.severity,
    passed: false,
    message: rule.message,
    details,
  };
}

function evaluate(rule: Rule, spec: ProductSpec, profile?: BrandProfile): RuleResult {
  switch (rule.type) {
    case "sum_ports_equals_total": {
      const sum = spec.ports.reduce((acc, p) => acc + (Number(p.maxW) || 0), 0);
      const maxPort = spec.ports.reduce((acc, p) => Math.max(acc, Number(p.maxW) || 0), 0);
      const total = Number(spec.totalOutputW) || 0;
      const tol = rule.toleranceW ?? 0;

      if (rule.strict || spec.ports.length <= 1) {
        if (Math.abs(sum - total) > tol) {
          return fail(rule, [`Сума портів: ${sum} Вт`, `Total Output: ${total} Вт`]);
        }
        return pass(rule);
      }
      if (total > sum + tol) {
        return fail(rule, [
          `Total Output (${total} Вт) більший за суму портів (${sum} Вт) — фізично неможливо.`,
        ]);
      }
      if (total < maxPort - tol) {
        return fail(rule, [
          `Total Output (${total} Вт) менший за найпотужніший порт (${maxPort} Вт).`,
        ]);
      }
      return pass(rule);
    }

    case "required_certs": {
      const required = [...rule.base, ...(spec.wireless ? rule.ifWireless : [])];
      const have = spec.certifications.map((c) => c.toUpperCase());
      const missing = required.filter((c) => !have.includes(c.toUpperCase()));
      if (missing.length) return fail(rule, [`Відсутні: ${missing.join(", ")}`]);
      return pass(rule);
    }

    case "required_fields": {
      const missing = rule.fields.filter((f) => isBlank(getByPath(spec, f)));
      if (missing.length) return fail(rule, [`Не заповнено: ${missing.join(", ")}`]);
      return pass(rule);
    }

    case "forbidden_chars": {
      const blob = [
        spec.model,
        spec.productNameUk,
        spec.color,
        spec.material,
        spec.notes,
        ...spec.extraSpecs.map((e) => `${e.label} ${e.value}`),
      ].join(" ");
      const found = rule.chars.filter((c) => blob.includes(c));
      if (found.length) return fail(rule, [`Знайдено: ${found.join(" ")}`]);
      return pass(rule);
    }

    case "ean_checksum": {
      if (isBlank(spec.ean13)) return pass(rule);
      const res = ean13Checksum(spec.ean13);
      if (!res.valid) return fail(rule, [res.reason ?? "Некоректний EAN-13"]);
      return pass(rule);
    }

    case "range": {
      const value = Number(getByPath(spec, rule.field));
      if (Number.isNaN(value)) return fail(rule, [`Поле ${rule.field} не є числом`]);
      const unit = rule.unit ? ` ${rule.unit}` : "";
      if (rule.min !== undefined && value < rule.min) {
        return fail(rule, [`${value}${unit} < мінімум ${rule.min}${unit}`]);
      }
      if (rule.max !== undefined && value > rule.max) {
        return fail(rule, [`${value}${unit} > максимум ${rule.max}${unit}`]);
      }
      return pass(rule);
    }

    case "regex": {
      const raw = String(getByPath(spec, rule.field) ?? "");
      if (isBlank(raw)) return pass(rule);
      const re = new RegExp(rule.pattern);
      if (!re.test(raw)) return fail(rule, [rule.hint ?? `«${raw}» не відповідає шаблону`]);
      return pass(rule);
    }

    case "engraving_regex": {
      if (!profile) return pass(rule);
      const re = new RegExp(rule.pattern);
      const hits: string[] = [];
      for (const format of ["full", "compact"] as const) {
        const text = buildEngravingPlan(spec, profile, { format }).text;
        for (const line of text.split("\n")) {
          if (re.test(line)) hits.push(`[${format}] ${line}`);
        }
      }
      if (hits.length) return fail(rule, [...(rule.hint ? [rule.hint] : []), ...hits.slice(0, 4)]);
      return pass(rule);
    }

    default:
      return pass(rule);
  }
}
