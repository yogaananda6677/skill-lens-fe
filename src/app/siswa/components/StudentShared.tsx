"use client";

import { useMemo, useState, type ReactNode } from "react";

export type ArrayField = "interests" | "hobbies" | "talents" | "experiences";

export function Panel({
  children,
  id,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 rounded-[1.8rem] border border-sky-100 bg-white/95 p-5 shadow-lg shadow-sky-950/5 md:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function toList(text: string) {
  return text
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function average(scores: Record<string, number | undefined>) {
  const values = Object.values(scores).filter(
    (value): value is number =>
      typeof value === "number" && Number.isFinite(value) && value > 0,
  );

  if (!values.length) return 0;

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-sky-600 bg-sky-600 text-white shadow-sm shadow-sky-600/20"
          : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
      }`}
    >
      {label}
    </button>
  );
}

export function OptionPicker({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const filtered = keyword
      ? options.filter((item) => item.toLowerCase().includes(keyword))
      : options;

    const pinned = selected.filter((item) => !filtered.includes(item));

    return [...pinned, ...filtered].slice(0, 28);
  }, [options, query, selected]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
          {selected.length} dipilih
        </span>
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cari pilihan..."
        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
      />

      <div className="mt-4 flex max-h-52 flex-wrap gap-2 overflow-y-auto pr-1">
        {visible.map((option) => (
          <ToggleChip
            key={option}
            label={option}
            active={selected.includes(option)}
            onClick={() => onToggle(option)}
          />
        ))}
      </div>
    </div>
  );
}