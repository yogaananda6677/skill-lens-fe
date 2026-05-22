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
      className={`scroll-mt-28 rounded-[1.9rem] p-5 md:p-6 skilllens-smooth-card ${className}`}
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
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
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
          ? "border-sky-400 bg-[#0a54c7] text-white shadow-sm shadow-sky-700/10"
          : "border-sky-100 bg-white/90 text-slate-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
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
  const [visibleLimit, setVisibleLimit] = useState(80);

  const filteredOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const seen = new Set<string>();

    return options.filter((item) => {
      const label = String(item ?? "").trim();
      if (!label) return false;

      const key = label.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);

      return keyword ? key.includes(keyword) : true;
    });
  }, [options, query]);

  const visible = useMemo(() => {
    const pinned = selected.filter((item) => !filteredOptions.includes(item));
    return [...pinned, ...filteredOptions].slice(0, visibleLimit);
  }, [filteredOptions, selected, visibleLimit]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setVisibleLimit(value.trim() ? 120 : 80);
  }

  const totalAvailable = options.length;
  const totalMatched = filteredOptions.length;

  return (
    <div className="rounded-[1.55rem] border border-sky-100/80 bg-white/80 p-4 shadow-sm shadow-sky-950/5 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
          {selected.length} dipilih • {totalAvailable} opsi
        </span>
      </div>

      <input
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        placeholder="Cari pilihan..."
        className="mt-4 w-full rounded-2xl border border-sky-100 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100 skilllens-smooth"
      />

      <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-slate-400">
        <span>
          Menampilkan {Math.min(visible.length, totalMatched)} dari {totalMatched} hasil
        </span>
        {!query.trim() && totalAvailable > 80 ? (
          <span>Ketik kata kunci agar pilihan lebih cepat ketemu</span>
        ) : null}
      </div>

      <div className="mt-3 flex max-h-72 flex-wrap gap-2 overflow-y-auto pr-1">
        {visible.map((option) => (
          <ToggleChip
            key={option}
            label={option}
            active={selected.includes(option)}
            onClick={() => onToggle(option)}
          />
        ))}
      </div>

      {visible.length < totalMatched ? (
        <button
          type="button"
          onClick={() => setVisibleLimit((current) => current + 120)}
          className="mt-3 rounded-full border border-cyan-100 bg-white px-4 py-2 text-xs font-bold text-sky-700 skilllens-smooth hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50"
        >
          Tampilkan lebih banyak
        </button>
      ) : null}

      {!visible.length ? (
        <p className="mt-4 rounded-2xl bg-white p-3 text-xs font-semibold text-slate-400 ring-1 ring-slate-100">
          Tidak ada pilihan yang cocok. Coba kata kunci lain.
        </p>
      ) : null}
    </div>
  );
}