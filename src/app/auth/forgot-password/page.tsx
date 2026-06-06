"use client";

import { useMemo, useState } from "react";
import type React from "react";

import { Icon } from "../../../components/ui/icons";
import { notifyAppAlert } from "../../../lib/app-alert-events";
import { apiFetch } from "../../../lib/axios";
import { getPasswordChecks, getPasswordStrength } from "../../../lib/form-rules";

function InputShell({
  label,
  children,
  helper,
}: {
  label: string;
  children: React.ReactNode;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-black text-slate-800">{label}</span>
      {children}
      {helper ? <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-500">{helper}</p> : null}
    </label>
  );
}

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [requestingOtp, setRequestingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);

  const passwordChecks = useMemo(() => getPasswordChecks(newPassword), [newPassword]);
  const passwordScore = passwordChecks.filter((item) => item.valid).length;
  const passwordStrength = getPasswordStrength(passwordScore, passwordChecks.length);
  const passwordReady = passwordChecks.every((item) => item.valid);
  const confirmReady = confirmPassword.length > 0 && confirmPassword === newPassword;
  const progressWidth = Math.max(8, Math.round((passwordScore / passwordChecks.length) * 100));

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

      notifyAppAlert({ type: "success", title: "OTP berhasil dikirim", description: "Cek email yang terdaftar pada akun SkillLens.", autoCloseMs: 2600 });
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
      notifyAppAlert({ type: "error", title: "OTP wajib 6 digit", autoCloseMs: 2400 });
      return;
    }

    if (!passwordReady) {
      notifyAppAlert({ type: "error", title: "Password belum memenuhi ketentuan", autoCloseMs: 2600 });
      return;
    }

    if (!confirmReady) {
      notifyAppAlert({ type: "error", title: "Konfirmasi password belum sama", autoCloseMs: 2400 });
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
    <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.25),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.28),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/15 bg-white shadow-2xl shadow-sky-950/40 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#081a3a] via-[#0b3b73] to-sky-600 p-8 text-white lg:block">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:38px_38px]" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between gap-10">
              <div>
                <div className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-lg shadow-sky-950/20 backdrop-blur">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-sky-700">
                    <Icon name="sparkles" className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black tracking-tight">SkillLens</p>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-cyan-100">Account Recovery</p>
                  </div>
                </div>

                <h1 className="mt-12 max-w-md text-4xl font-black leading-tight tracking-tight">
                  Pulihkan akses akun dengan lebih aman.
                </h1>

                <p className="mt-4 max-w-md text-sm font-medium leading-7 text-sky-100">
                  Masukkan akun yang terdaftar, ambil OTP dari email, lalu buat password baru yang kuat.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  { icon: "mail", title: "1. Minta OTP", desc: "Kode dikirim ke email akun." },
                  { icon: "shield", title: "2. Verifikasi kode", desc: "Gunakan 6 digit OTP yang masih aktif." },
                  { icon: "lock", title: "3. Buat password baru", desc: "Gunakan kombinasi huruf, angka, dan simbol." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-3xl border border-white/12 bg-white/10 p-4 backdrop-blur">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/14 text-cyan-100 ring-1 ring-white/15">
                      <Icon name={item.icon} className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{item.title}</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-sky-100">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="bg-gradient-to-b from-white via-sky-50/40 to-white p-6 sm:p-8 lg:p-10">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/auth/login";
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Icon name="arrowLeft" className="h-4 w-4" />
              Kembali ke Login
            </button>

            <div className="mt-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-sky-700">Reset Password</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Lupa kata sandi?</h2>
              <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-600">
                Isi data di bawah ini untuk membuat password baru. Pastikan password mudah kamu ingat, tapi sulit ditebak orang lain.
              </p>
            </div>

            <form onSubmit={resetPassword} className="mt-7 space-y-5">
              <InputShell label="Username atau email">
                <div className="relative">
                  <Icon name="user" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value.trim().toLowerCase())}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                    placeholder="contoh: yoga@email.com"
                    autoComplete="username"
                  />
                </div>
              </InputShell>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <InputShell label="Kode OTP" helper="Masukkan 6 digit kode dari email.">
                  <input
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    maxLength={6}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black tracking-[0.45em] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                    placeholder="000000"
                    autoComplete="one-time-code"
                  />
                </InputShell>

                <button
                  type="button"
                  disabled={requestingOtp}
                  onClick={requestOtp}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-3 text-sm font-black text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Icon name="mail" className="h-4 w-4" />
                  {requestingOtp ? "Mengirim..." : "Kirim OTP"}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InputShell label="Password baru">
                  <div className="relative">
                    <Icon name="lock" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                      placeholder="Minimal 8 karakter"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Tampilkan password"
                    >
                      <Icon name={showPassword ? "eyeOff" : "eye"} className="h-4 w-4" />
                    </button>
                  </div>
                </InputShell>

                <InputShell label="Konfirmasi password">
                  <div className="relative">
                    <Icon name="lock" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                      placeholder="Ulangi password baru"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Tampilkan konfirmasi password"
                    >
                      <Icon name={showConfirmPassword ? "eyeOff" : "eye"} className="h-4 w-4" />
                    </button>
                  </div>
                </InputShell>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-slate-800">Kekuatan password</p>
                  <p className={`text-xs font-black ${passwordStrength.text}`}>{passwordStrength.label}</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full transition-all duration-500 ${passwordStrength.bar}`} style={{ width: `${progressWidth}%` }} />
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {passwordChecks.map((item) => (
                    <div key={item.label} className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold transition ${item.valid ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-slate-50 text-slate-500 ring-1 ring-slate-100"}`}>
                      <Icon name={item.valid ? "check" : "x"} className="h-3.5 w-3.5" />
                      {item.label}
                    </div>
                  ))}
                  <div className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold transition ${confirmReady ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-slate-50 text-slate-500 ring-1 ring-slate-100"}`}>
                    <Icon name={confirmReady ? "check" : "x"} className="h-3.5 w-3.5" />
                    Konfirmasi sama
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={resetting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-blue-700 to-sky-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-sky-600/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="shield" className="h-4 w-4" />
                {resetting ? "Menyimpan password..." : "Reset Password"}
              </button>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}
