"use client";

import { Icon } from "./icons";

type FeedbackModalProps = {
  open: boolean;
  type?: "success" | "error" | "info";
  title: string;
  description?: string;
  actionLabel?: string;
  onClose: () => void;
  onAction?: () => void;
};

export function FeedbackModal({ open, type = "success", title, description, actionLabel = "Mengerti", onClose, onAction }: FeedbackModalProps) {
  if (!open) return null;

  const tone = {
    success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    error: "bg-rose-50 text-rose-700 ring-rose-100",
    info: "bg-sky-50 text-sky-700 ring-sky-100",
  }[type];

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center px-4 py-6">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" aria-label="Tutup notifikasi" />
      <section className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-white p-6 shadow-2xl shadow-slate-950/20">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-950" aria-label="Tutup">
          <Icon name="x" className="h-4 w-4" />
        </button>
        <div className={`grid h-14 w-14 place-items-center rounded-2xl ring-1 ${tone}`}>
          <Icon name={type === "error" ? "alert" : "check"} className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950">{title}</h2>
        {description && <p className="mt-3 text-sm font-medium leading-7 text-slate-500">{description}</p>}
        <button type="button" onClick={onAction ?? onClose} className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-sky-800">
          {actionLabel}
        </button>
      </section>
    </div>
  );
}
