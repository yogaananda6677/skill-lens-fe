"use client";

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/30">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-sky-700">
                Konfirmasi keluar
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                Keluar dari akun?
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
              aria-label="Tutup modal"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="flex gap-4 rounded-2xl bg-sky-50 p-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-600 text-white">
              <Icon name="logout" className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                {username
                  ? `Akun ${username} akan keluar dari sistem.`
                  : "Akun Anda akan keluar dari sistem."}
              </p>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                Anda perlu login kembali untuk mengakses dashboard dan data
                SkillLens.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Ya, keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}