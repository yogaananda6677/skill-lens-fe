"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
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
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const tone = {
    success: "bg-sky-100 text-sky-700 ring-sky-200",
    error: "bg-rose-100 text-rose-700 ring-rose-200",
    info: "bg-sky-100 text-sky-700 ring-sky-200",
  }[type];

  return createPortal(
    <div className="fixed inset-0 z-[1200] grid place-items-center bg-slate-950/50 px-4 py-6 text-slate-950 backdrop-blur-[4px]">
      <button type="button" onClick={onClose} className="absolute inset-0 cursor-default" aria-label="Tutup notifikasi" />
      <section className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/30 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.35)]">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-950" aria-label="Tutup">
          <Icon name="x" className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-slate-50 via-white to-sky-50/40 px-6 py-7">
          <div className={`grid h-14 w-14 place-items-center rounded-2xl ring-1 ${tone}`}>
            <Icon name={type === "error" ? "alert" : "check"} className="h-6 w-6" />
          </div>
          <h2 className="mt-5 pr-10 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
          {description && <p className="mt-3 text-sm font-medium leading-7 text-slate-500">{description}</p>}
          <button type="button" onClick={onAction ?? onClose} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#0b2450] to-sky-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-md shadow-sky-600/20 transition hover:-translate-y-0.5">
            {actionLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
