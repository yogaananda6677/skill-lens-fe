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
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
            : "border-slate-200 focus:border-blue-300 focus:bg-white focus:ring-blue-50"
        }`}
      />
      {error ? <p className="mt-1 text-xs font-medium text-rose-600">{error}</p> : null}
    </label>
  );
}

export function StatusMessage({ message, error }: { message: string; error: string }) {
  if (!message && !error) return null;
  return (
    <div
      className={`rounded-xl p-3 text-sm font-medium leading-5 ${
        error
          ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
          : "bg-green-50 text-green-800 ring-1 ring-green-100"
      }`}
    >
      {error || message}
    </div>
  );
}

export function UploadProgress({ progress }: { progress: UploadProgressState | null }) {
  if (!progress) return null;
  const eta =
    progress.estimatedSecondsLeft === null
      ? "Sedang diproses"
      : `${progress.estimatedSecondsLeft} detik lagi`;
  return (
    <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
      <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
        <span>
          {progress.phase === "uploading"
            ? "Mengunggah file"
            : progress.phase === "processing"
            ? "Memproses data"
            : "Selesai"}
        </span>
        <span>{progress.percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-medium text-slate-500">
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
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      <div className="rounded-xl bg-white p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
            <Icon name={icon as any} className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{eyebrow}</p>
        </div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
        <div className="mt-5">{children}</div>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70 rounded-b-xl" />
    </div>
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
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-amber-50/40 to-amber-100/20 p-[1px] shadow-md">
      <div className="rounded-xl bg-white p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-full bg-amber-100 p-1.5 text-amber-600">
            <Icon name="lock" className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Terkunci</p>
        </div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
        {statusMessage && (
          <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            {statusMessage}
          </div>
        )}
        <button
          type="button"
          onClick={onGoSchool}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
        >
          Ajukan / cek sekolah
        </button>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-70 rounded-b-xl" />
    </div>
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