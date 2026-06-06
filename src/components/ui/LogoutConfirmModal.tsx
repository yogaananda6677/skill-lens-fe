"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./icons";

type LogoutConfirmModalProps = {
  open: boolean;
  username?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function LogoutConfirmModal({
  open,
  username,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/58 px-4 py-6 text-slate-950 backdrop-blur-[4px]">
      <button
        type="button"
        aria-label="Tutup modal logout"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <section className="relative w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/30 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.35)]">
        <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-r from-[#0b2450] via-[#0d3c70] to-sky-600 px-6 py-5 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-100">
                Konfirmasi Akun
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                Keluar dari SkillLens?
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-sky-100/90">
                Sesi akan diakhiri dan kamu perlu login kembali.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Tutup modal"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 via-white to-sky-50/40 px-6 py-6">
          <div className="flex gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200">
              <Icon name="logout" className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-extrabold text-slate-900">
                {username
                  ? `Akun ${username} akan keluar dari sistem.`
                  : "Akun Anda akan keluar dari sistem."}
              </p>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                Pastikan data yang sedang dikerjakan sudah tersimpan sebelum keluar.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white/95 px-6 py-4 shadow-[0_-12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="rounded-2xl bg-gradient-to-r from-[#0b2450] to-sky-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition hover:-translate-y-0.5"
            >
              Ya, keluar
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
