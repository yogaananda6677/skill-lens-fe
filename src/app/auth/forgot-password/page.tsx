"use client";

import { useState } from "react";
import type React from "react";
import { notifyAppAlert } from "../../../lib/app-alert-events";
import { apiFetch } from "../../../lib/axios";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [requestingOtp, setRequestingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function requestOtp() {
    if (!identifier.trim()) {
      notifyAppAlert({ type: "error", title: "Username atau email wajib diisi", autoCloseMs: 2400 });
      return;
    }

    setRequestingOtp(true);

    try {
      await apiFetch<{
        message?: string;
        dev_otp?: string;
      }>("/auth/forgot-password/request-otp", {
        method: "POST",
        body: JSON.stringify({
          identifier: identifier.trim(),
        }),
        successMessage: false,
        errorMessage: false,
        skipAuth: true,
      });

      notifyAppAlert({ type: "success", title: "Kode OTP telah dikirim", description: "Silakan cek email Anda.", autoCloseMs: 2600 });
    } catch (err) {
      notifyAppAlert({ type: "error", title: "Gagal meminta OTP", description: err instanceof Error ? err.message : "Gagal meminta OTP.", autoCloseMs: false });
    } finally {
      setRequestingOtp(false);
    }
  }

  async function resetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!identifier.trim()) {
      notifyAppAlert({ type: "error", title: "Username atau email wajib diisi", autoCloseMs: 2400 });
      return;
    }

    if (!otp || otp.length !== 6) {
      notifyAppAlert({ type: "error", title: "OTP wajib diisi 6 digit", autoCloseMs: 2400 });
      return;
    }

    if (newPassword.length < 8) {
      notifyAppAlert({ type: "error", title: "Password baru minimal 8 karakter", autoCloseMs: 2400 });
      return;
    }

    if (newPassword !== confirmPassword) {
      notifyAppAlert({ type: "error", title: "Konfirmasi password baru tidak sesuai", autoCloseMs: 2400 });
      return;
    }

    setResetting(true);

    try {
      const result = await apiFetch<{ message?: string }>(
        "/auth/forgot-password/reset",
        {
          method: "POST",
          body: JSON.stringify({
            identifier: identifier.trim(),
            otp,
            new_password: newPassword,
            confirm_password: confirmPassword,
          }),
          successMessage: false,
          errorMessage: false,
          skipAuth: true,
        },
      );

      notifyAppAlert({ type: "success", title: "Password berhasil direset", description: result.message || "Silakan login kembali.", autoCloseMs: 2200 });

      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1200);
    } catch (err) {
      notifyAppAlert({ type: "error", title: "Gagal reset password", description: err instanceof Error ? err.message : "Gagal reset password.", autoCloseMs: false });
    } finally {
      setResetting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white p-8 text-slate-950 shadow-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-blue-700">
            Skill Lens
          </p>

          <h1 className="mt-3 text-3xl font-extrabold">Lupa Kata Sandi</h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Masukkan username/email, minta OTP, lalu buat password baru.
          </p>

          <form onSubmit={resetPassword} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">
                Username atau email
              </span>
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                placeholder="username atau email"
              />
            </label>

            <div className="flex flex-wrap items-end gap-3">
              <label className="min-w-[180px] flex-1">
                <span className="mb-1 block text-sm font-semibold text-slate-700">
                  OTP
                </span>
                <input
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm tracking-[0.3em] outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="6 digit"
                />
              </label>

              <button
                type="button"
                disabled={requestingOtp}
                onClick={requestOtp}
                className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
              >
                {requestingOtp ? "Mengirim..." : "Kirim OTP"}
              </button>
            </div>

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
              disabled={resetting}
              className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {resetting ? "Menyimpan..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/auth/login";
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Kembali ke Login
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}