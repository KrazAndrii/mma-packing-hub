export type Language = "EN" | "DE" | "ES" | "FR" | "UA" | "IT" | "RO" | "PL" | "BG";

export type Category =
  | "car_charger"
  | "wall_charger"
  | "power_bank"
  | "cable"
  | "tws"
  | "case"
  | "glass"
  | "other";

export type Severity = "error" | "warning" | "info";

export interface CompanyInfo {
  name: string;
  address: string;
  phone?: string;
  country: string;
}

export interface PortOutput {
  volts: string;
  amps: string;
  watts?: number;
}

export interface PortSpec {
  id: string;
  type: string;
  protocols: string[];
  outputs: PortOutput[];
  ppsOutputs?: PortOutput[];
  maxW: number;
  direction?: "input" | "output";
  label?: string;
}

export interface InputSpec {
  kind: "AC" | "DC";
  voltage: string;
  current?: string;
  frequency?: string;
  maxW?: number;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export type EngravingSection = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type EngravingFormat = "full" | "compact";

export interface BatterySpec {
  capacityMah?: number;
  voltage?: number;
  wh?: number;
}

export interface ExtraSpec {
  label: string;
  value: string;
  section: EngravingSection;
}

export interface ProductSpec {
  id: string;
  brand: string;
  category: Category;
  model: string;
  nameFrom1C: string;
  orderNumber: string;
  productNameUk: string;
  color: string;
  material: string;
  dimensions: Dimensions;
  weightG: number;
  totalOutputW: number;
  input: InputSpec;
  ports: PortSpec[];
  wireless: boolean;
  battery?: BatterySpec;
  conversionRate?: number;
  magneticForce?: string;
  driverSize?: string;
  audioCodecs?: string;
  dataTransfer?: string;
  modeLabel?: string;
  technologies: string[];
  certifications: string[];
  manufacturer: CompanyInfo;
  importer: CompanyInfo;
  productionDate: string;
  warrantyMonths: number;
  storageHumidity: string;
  storageTempMin: number;
  storageTempMax: number;
  serviceLife: string;
  packageContents: string[];
  ean13: string;
  languages: Language[];
  marketingBullets: Partial<Record<Language, string[]>>;
  extraSpecs: ExtraSpec[];
  notes: string;
}

export interface NormalizedOutput {
  label: string;
  text: string;
  watts: number;
}

export interface EngravingLine {
  text: string;
  bold?: boolean;
  size?: number;
}

export interface EngravingResult {
  lines: EngravingLine[];
  symbols: string[];
  svg: string;
  dxf: string;
  widthMm: number;
  heightMm: number;
}
