"use client";

import { useState } from "react";
import { Icon } from "../../../components/ui/icons";
import { apiFetch } from "../../../lib/axios";
import {
  getStoredUser,
  persistAuth,
  type AuthRole,
} from "../../../lib/auth";

type StudentPasswordReminderDialogProps = {
  open: boolean;
  onClose: () => void;
  onPasswordChanged?: () => void;
};

type ChangePasswordResponse = {
  message?: string;
  token?: string;
  user?: {
    id: number;
    nama: string;
    email?: string;
    username: string;
    role: AuthRole;
    id_sekolah?: number | null;
    must_change_password?: boolean;
  };
};

export function StudentPasswordReminderDialog({
  open,
  onClose,
  onPasswordChanged,
}: StudentPasswordReminderDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Password lama/default, password baru, dan konfirmasi wajib diisi.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak sesuai.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiFetch<ChangePasswordResponse>(
        "/auth/change-default-password",
        {
          method: "POST",
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
          }),
          alert: false,
          successMessage: false,
          errorMessage: false,
        },
      );

      if (result.token && result.user) {
        persistAuth(
          result.token,
          {
            id: result.user.id,
            nama: result.user.nama,
            email: result.user.email,
            username: result.user.username,
            role: result.user.role,
            id_sekolah: result.user.id_sekolah ?? null,
            must_change_password: false,
          },
          localStorage.getItem("skilllens_remember") === "true",
        );
      } else {
        const storedUser = getStoredUser();
        if (storedUser) {
          persistAuth(
            localStorage.getItem("skilllens_token") || "",
            { ...storedUser, must_change_password: false },
            localStorage.getItem("skilllens_remember") === "true",
          );
        }
      }

      setSuccess(result.message || "Password berhasil diganti.");
      onPasswordChanged?.();

      window.setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengganti password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/60 px-4 py-8 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl shadow-slate-950/30">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
          aria-label="Tutup pengingat password"
        >
          <Icon name="x" className="h-5 w-5" />
        </button>

        <div className="relative p-7 md:p-8">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
            <Icon name="lock" className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950">
            Password kamu masih default
          </h2>

          <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
            Kamu tetap bisa masuk dashboard, tetapi sebaiknya segera mengganti password agar akun lebih aman. Dialog ini bisa ditutup, namun akan muncul lagi setiap login selama password belum diganti.
          </p>

          {!showForm ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Ganti password sekarang
                <Icon name="chevronRight" className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Nanti saja
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  {success}
                </div>
              )}

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Password lama/default
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm font-semibold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    placeholder="Masukkan password lama/default"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-3 grid place-items-center rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Icon name={showPassword ? "eyeOff" : "eye"} className="h-5 w-5" />
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Password baru
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="Minimal 8 karakter"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Konfirmasi password baru
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="Ulangi password baru"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan password"}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Lewati dulu
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
