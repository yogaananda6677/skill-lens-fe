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
    <div
      className={`fixed inset-0 ${zIndexClass} grid place-items-center bg-slate-950/38 p-4 text-slate-950 backdrop-blur-[3px] sm:p-6`}
    >
      <button
        type="button"
        aria-label="Tutup panel"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <section
        role="dialog"
        aria-modal="true"
        className={`relative flex max-h-[90dvh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-[1.8rem] border border-sky-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.22)]`}
      >
        <div className="relative shrink-0 overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-5 py-5 text-slate-950 sm:px-7">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.045)_1px,transparent_1px)] bg-[size:34px_34px]" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-60 w-60 rounded-full bg-cyan-200/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-sky-200/20 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
                <Icon name="spark" className="h-3.5 w-3.5" />
                {eyebrow}
              </p>

              <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-[1.7rem]">
                {title}
              </h2>

              {desc && (
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                  {desc}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Tutup panel"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-br from-white via-slate-50/50 to-sky-50/35 px-5 py-5 sm:px-7">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-slate-100 bg-white/95 px-5 py-4 shadow-[0_-12px_30px_rgba(15,23,42,0.05)] backdrop-blur sm:px-7">
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
  const isDanger = tone === "danger";

  const confirmClass = isDanger
    ? "bg-rose-600 text-white shadow-rose-600/20 hover:bg-rose-700 hover:-translate-y-0.5"
    : "bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 text-white shadow-sky-600/20 hover:-translate-y-0.5";

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
      <div className="py-4">
        <div className="w-full rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm sm:p-8">
          <div
            className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ring-1 ${
              isDanger
                ? "bg-rose-50 text-rose-600 ring-rose-100"
                : "bg-sky-50 text-sky-700 ring-sky-100"
            }`}
          >
            <Icon name={isDanger ? "x" : "shield"} className="h-6 w-6" />
          </div>

          <h3 className="mt-5 text-xl font-black tracking-tight text-slate-950">
            {title}
          </h3>

          <div className="mx-auto mt-3 max-w-xl text-sm font-medium leading-7 text-slate-500">
            {desc}
          </div>
        </div>
      </div>
    </AdminFullScreenModal>
  );
}