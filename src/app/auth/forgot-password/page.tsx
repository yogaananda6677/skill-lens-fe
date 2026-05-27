"use client";

import { useState } from "react";
import type React from "react";
import { apiFetch } from "../../../lib/axios";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [requestingOtp, setRequestingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function requestOtp() {
    setMessage("");
    setError("");
    setDevOtp("");

    if (!identifier.trim()) {
      setError("Username atau email wajib diisi.");
      return;
    }

    setRequestingOtp(true);

    try {
      const result = await apiFetch<{
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

      if (result.dev_otp) {
        setDevOtp(result.dev_otp);
        setOtp(result.dev_otp);
      }

      setMessage(result.message || "OTP berhasil dikirim.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal meminta OTP.");
    } finally {
      setRequestingOtp(false);
    }
  }

  async function resetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!identifier.trim()) {
      setError("Username atau email wajib diisi.");
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("OTP wajib diisi 6 digit.");
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

      setMessage(
        result.message || "Password berhasil direset. Silakan login kembali.",
      );

      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal reset password.");
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

          {devOtp && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              Mode development: OTP kamu adalah{" "}
              <span className="font-extrabold tracking-[0.2em]">{devOtp}</span>
            </div>
          )}

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