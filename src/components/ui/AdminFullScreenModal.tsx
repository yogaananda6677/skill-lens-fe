"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./icons";

type AdminFullScreenModalProps = {
  eyebrow?: string;
  title: string;
  desc?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  maxWidthClass?: string;
  zIndexClass?: string;
};

export function AdminFullScreenModal({
  eyebrow = "Panel Admin",
  title,
  desc,
  children,
  footer,
  onClose,
  maxWidthClass = "max-w-4xl",
  zIndexClass = "z-[100]",
}: AdminFullScreenModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={`fixed inset-0 ${zIndexClass} grid place-items-center bg-slate-950/58 p-4 text-slate-950 backdrop-blur-[4px] sm:p-6`}>
      <button
        type="button"
        aria-label="Tutup panel"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <section
        role="dialog"
        aria-modal="true"
        className={`relative flex max-h-[90dvh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-[1.5rem] border border-white/30 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.35)]`}
      >
        <div className="relative shrink-0 overflow-hidden border-b border-sky-100 bg-gradient-to-r from-[#0b2450] via-[#0d3c70] to-sky-600 px-5 py-4 text-white sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-100">{eyebrow}</p>
              <h2 className="mt-1.5 text-2xl font-black tracking-tight text-white sm:text-[1.65rem]">{title}</h2>
              {desc && <p className="mt-1.5 max-w-2xl text-sm font-medium leading-6 text-sky-100/90">{desc}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Tutup panel"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-sky-50/40 px-5 py-4 sm:px-6">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-slate-100 bg-white/95 px-5 py-3.5 shadow-[0_-12px_30px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6">
            {footer}
          </div>
        )}
      </section>
    </div>,
    document.body,
  );
}

type AdminConfirmModalProps = {
  title: string;
  desc: ReactNode;
  confirmLabel: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  tone?: "danger" | "primary";
};

export function AdminConfirmModal({
  title,
  desc,
  confirmLabel,
  loading = false,
  onCancel,
  onConfirm,
  tone = "danger",
}: AdminConfirmModalProps) {
  const confirmClass =
    tone === "danger"
      ? "bg-rose-600 text-white shadow-rose-600/15 hover:bg-rose-700"
      : "bg-gradient-to-r from-[#0b2450] to-sky-600 text-white shadow-sky-600/20 hover:-translate-y-0.5";

  return (
    <AdminFullScreenModal
      eyebrow="Konfirmasi Admin"
      title={title}
      desc="Periksa kembali data sebelum tindakan diproses."
      onClose={onCancel}
      maxWidthClass="max-w-md"
      zIndexClass="z-[110]"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`rounded-2xl px-5 py-3 text-sm font-bold shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
          >
            {loading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="py-6">
        <div className="w-full rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200">
            <Icon name="shield" className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-black tracking-tight text-slate-950">{title}</h3>
          <div className="mx-auto mt-3 max-w-xl text-sm font-medium leading-7 text-slate-500">{desc}</div>
        </div>
      </div>
    </AdminFullScreenModal>
  );
}
