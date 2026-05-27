"use client";

import { useState } from "react";
import type React from "react";
import { apiFetch } from "../../../lib/axios";
import {
  getStoredUser,
  persistAuth,
  redirectPathByRole,
  type AuthRole,
} from "../../../lib/auth";

export default function ForceChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Semua field wajib diisi.");
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
      const result = await apiFetch<{
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
      }>("/auth/change-default-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
        successMessage: false,
        errorMessage: false,
      });

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

        window.location.href = redirectPathByRole(result.user.role);
        return;
      }

      const storedUser = getStoredUser();

      if (storedUser) {
        window.location.href = redirectPathByRole(storedUser.role);
      } else {
        window.location.href = "/auth/login";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengganti password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white p-8 text-slate-950 shadow-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-blue-700">
            Skill Lens
          </p>

          <h1 className="mt-3 text-3xl font-extrabold">
            Ganti Password Default
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Akun kamu masih memakai password awal. Guru memakai NIP/NUPTK,
            siswa memakai NISN. Silakan ganti password sebelum masuk dashboard.
          </p>

          {(message || error) && (
            <div
              className={`mt-5 rounded-2xl px-4 py-3 text-sm font-semibold ${
                error
                  ? "border border-red-100 bg-red-50 text-red-700"
                  : "border border-emerald-100 bg-emerald-50 text-emerald-700"
              }`}
            >
              {error || message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">
                Password lama/default
              </span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                placeholder="NIP/NISN/password lama"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">
                Password baru
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                placeholder="Minimal 8 karakter"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">
                Konfirmasi password baru
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                placeholder="Ulangi password baru"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Ganti Password & Masuk"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}