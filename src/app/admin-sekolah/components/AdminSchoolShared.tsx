import type { UploadProgressState } from "../../../lib/upload";
import { Icon } from "../../../components/ui/icons";

export function Field({
  label,
  value,
  placeholder,
  type = "text",
  error,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
            : "border-slate-200 focus:border-sky-500 focus:ring-sky-100"
        }`}
      />

      {error ? (
        <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>
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
      className={`rounded-2xl p-4 text-sm font-medium leading-6 ${
        error
          ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
          : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
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

  return (
    <div className="mt-5 rounded-3xl border border-sky-100 bg-sky-50 p-4">
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
        <span>
          {progress.phase === "uploading"
            ? "Mengunggah file"
            : progress.phase === "processing"
              ? "Memproses data"
              : "Selesai"}
        </span>
        <span>{progress.percent}%</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      <p className="mt-3 text-xs font-medium text-slate-500">
        Estimasi: {progress.percent >= 100 ? "selesai" : eta}
      </p>
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
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-xl shadow-sky-950/5">
      <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-sky-700">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              {title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500">
              {description}
            </p>
          </div>

          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/20">
            <Icon name={icon as any} className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">{children}</div>
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
    <section className="rounded-[2rem] border border-amber-100 bg-white p-8 shadow-xl shadow-amber-950/5">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
        <Icon name="lock" className="h-6 w-6" />
      </div>

      <h2 className="mt-5 text-2xl font-bold text-slate-950">{title}</h2>

      <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500">
        {description}
      </p>

      {statusMessage ? (
        <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-800 ring-1 ring-amber-100">
          {statusMessage}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onGoSchool}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700"
      >
        Ajukan / cek sekolah
      </button>
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