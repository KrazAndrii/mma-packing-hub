"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[var(--border)] bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <section className="border-b border-[var(--border)] px-4 py-4 last:border-b-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  children,
  hint,
  className = "",
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="field-label">{label}</span>
      <div className="mt-1">{children}</div>
      {hint ? <span className="mt-1 block text-[11px] text-slate-400">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} ${className}`}
    />
  );
}

export function DraftInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [raw, setRaw] = useState(value);
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setRaw(value);
  }, [value]);
  return (
    <input
      type="text"
      value={raw}
      placeholder={placeholder}
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        setRaw(value);
      }}
      onChange={(e) => {
        setRaw(e.target.value);
        onChange(e.target.value);
      }}
      className={`${inputClass} ${className}`}
    />
  );
}

export function NumberInput({
  value,
  onChange,
  step = 1,
  className = "",
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  className?: string;
}) {
  return (
    <input
      type="number"
      step={step}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`${inputClass} ${className}`}
    />
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  className = "",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={`${inputClass} ${className}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function TextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} font-mono text-xs`}
    />
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  title?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
  const sizes = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm";
  const variants: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border border-[var(--border)] bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "text-red-600 hover:bg-red-50",
  };
  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick} className={`${base} ${sizes} ${variants[variant]}`}>
      {children}
    </button>
  );
}

export function Tabs<T extends string>({
  value,
  onChange,
  tabs,
}: {
  value: T;
  onChange: (v: T) => void;
  tabs: { value: T; label: string; badge?: number }[];
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-[var(--border)] px-2 pt-2">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={`rounded-t-md px-3 py-2 text-sm font-medium transition ${
            value === t.value
              ? "border border-b-0 border-[var(--border)] bg-white text-blue-700"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          {t.label}
          {t.badge ? (
            <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
              {t.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function StatusDot({ severity }: { severity: "error" | "warning" | "info" | "ok" }) {
  const colors: Record<string, string> = {
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
    ok: "bg-green-500",
  };
  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${colors[severity]}`} />;
}

export function CopyButton({ text, label = "Копіювати" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          setDone(false);
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
    >
      {done ? "Скопійовано" : label}
    </button>
  );
}

export function CopyableText({
  text,
  title,
  rows = 8,
}: {
  text: string;
  title: string;
  rows?: number;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2">
        <span className="text-xs font-semibold text-slate-600">{title}</span>
        <CopyButton text={text} />
      </div>
      <pre
        className="overflow-auto px-3 py-3 font-mono text-xs whitespace-pre-wrap text-slate-700"
        style={{ maxHeight: `${rows * 1.6}rem` }}
      >
        {text || "—"}
      </pre>
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4 fade-in" onClick={onClose}>
      <div
        className={`mt-6 w-full rounded-xl bg-white shadow-2xl ${wide ? "max-w-4xl" : "max-w-2xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="rounded px-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            ✕
          </button>
        </div>
        <div className="max-h-[72vh] overflow-auto p-4">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-[var(--border)] px-4 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "amber" | "red" | "blue" }) {
  const tones: Record<string, string> = {
    gray: "bg-slate-100 text-slate-600",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return <span className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

