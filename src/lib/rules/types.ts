import type { Category, Severity } from "../types";

export interface BaseRule {
  id: string;
  title: string;
  severity: Severity;
  message: string;
  categories: Category[] | "all";
  enabled: boolean;
}

export interface SumPortsRule extends BaseRule {
  type: "sum_ports_equals_total";
  toleranceW: number;
  strict: boolean;
}

export interface RequiredCertsRule extends BaseRule {
  type: "required_certs";
  base: string[];
  ifWireless: string[];
}

export interface RequiredFieldsRule extends BaseRule {
  type: "required_fields";
  fields: string[];
}

export interface ForbiddenCharsRule extends BaseRule {
  type: "forbidden_chars";
  chars: string[];
}

export interface EanChecksumRule extends BaseRule {
  type: "ean_checksum";
}

export interface RangeRule extends BaseRule {
  type: "range";
  field: string;
  min?: number;
  max?: number;
  unit?: string;
}

export interface RegexRule extends BaseRule {
  type: "regex";
  field: string;
  pattern: string;
  hint?: string;
}

export type Rule =
  | SumPortsRule
  | RequiredCertsRule
  | RequiredFieldsRule
  | ForbiddenCharsRule
  | EanChecksumRule
  | RangeRule
  | RegexRule;

export interface RuleResult {
  ruleId: string;
  title: string;
  severity: Severity;
  passed: boolean;
  message: string;
  details?: string[];
}
