import type { InputHTMLAttributes, ReactNode } from "react";
import type { UploadProgressState } from "../../../lib/upload";
import { Icon } from "../../../components/ui/icons";

const softPanelClass =
  "relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 shadow-sm shadow-sky-100/60";

const gridPatternClass =
  "pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]";

export function Field({
  label,
  value,
  placeholder,
  type = "text",
  error,
  success,
  loading,
  helper,
  inputMode,
  maxLength,
  autoComplete,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  error?: string;
  success?: string;
  loading?: string;
  helper?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  autoComplete?: string;
  onChange: (value: string) => void;
}) {
  const message = error || success || loading || helper;

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
            : success
              ? "border-emerald-200 focus:border-emerald-400 focus:ring-emerald-100"
              : "border-slate-200 focus:border-sky-300 focus:ring-sky-100"
        }`}
      />

      {message ? (
        <p
          className={`mt-1.5 text-xs font-semibold leading-5 ${
            error
              ? "text-rose-600"
              : success
                ? "text-emerald-600"
                : loading
                  ? "text-sky-600"
                  : "text-slate-400"
          }`}
        >
          {message}
        </p>
      ) : null}
    </label>
  );
}

export function StatusMessage({
  message,
  error,
}: {
  message: string;
  error: string;
}) {
  if (!message && !error) return null;

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold leading-6 shadow-sm ${
        error
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-sky-100 bg-gradient-to-r from-white via-cyan-50/60 to-sky-50/70 text-sky-700"
      }`}
    >
      {error || message}
    </div>
  );
}

export function UploadProgress({
  progress,
}: {
  progress: UploadProgressState | null;
}) {
  if (!progress) return null;

  const eta =
    progress.estimatedSecondsLeft === null
      ? "Sedang diproses"
      : `${progress.estimatedSecondsLeft} detik lagi`;

  const phaseLabel =
    progress.phase === "uploading"
      ? "Mengunggah file"
      : progress.phase === "processing"
        ? "Memproses data"
        : "Selesai";

  return (
    <div className="mt-5 overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 p-5 shadow-sm shadow-sky-100/60">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
            <Icon
              name={progress.percent >= 100 ? "check" : "upload"}
              className="h-4 w-4"
            />
          </div>

          <div>
            <p className="text-sm font-black text-slate-900">{phaseLabel}</p>
            <p className="text-xs font-semibold text-slate-500">
              Estimasi: {progress.percent >= 100 ? "selesai" : eta}
            </p>
          </div>
        </div>

        <span className="rounded-2xl border border-sky-100 bg-white px-3 py-1.5 text-sm font-black text-sky-700 shadow-sm">
          {progress.percent}%
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-sky-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300 transition-all duration-300"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}

export function PageCard({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <section className={softPanelClass}>
      <div className={gridPatternClass} />
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-sky-200/20 blur-3xl" />

      <div className="relative p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
            <Icon name={icon as any} className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700">
              {eyebrow}
            </p>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
              {title}
            </h2>

            <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6">{children}</div>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300 opacity-80" />
    </section>
  );
}

export function LockedFeatureCard({
  title,
  description,
  statusMessage,
  onGoSchool,
}: {
  title: string;
  description: string;
  statusMessage?: string;
  onGoSchool: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-white via-amber-50/40 to-sky-50/50 shadow-sm shadow-amber-100/50">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-sky-200/20 blur-3xl" />

      <div className="relative p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700 ring-1 ring-amber-200/70">
            <Icon name="lock" className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700">
              Terkunci
            </p>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
              {title}
            </h2>

            <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              {description}
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-white/75 px-4 py-3 text-sm font-semibold leading-6 text-amber-700 shadow-sm">
            {statusMessage}
          </div>
        )}

        <button
          type="button"
          onClick={onGoSchool}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          Ajukan / cek sekolah
          <Icon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-300 via-sky-400 to-cyan-300 opacity-80" />
    </section>
  );
}

export function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "SL"
  );
}
