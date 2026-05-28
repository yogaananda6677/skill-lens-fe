"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { PublicNavbar } from "../../../components/layout/PublicNavbar";
import { Icon } from "../../../components/ui/icons";
import { apiFetch } from "../../../lib/axios";
import {
  persistAuth,
  redirectPathByRole,
  type StoredUser,
} from "../../../lib/auth";

type LoginUser = StoredUser & {
  must_change_password?: boolean;
};

type LoginResponse = {
  message: string;
  token: string;
  user: LoginUser;
};

const processItems = [
  "Data sekolah, guru, siswa, dan nilai dikelola dalam satu sistem.",
  "Siswa melengkapi profil diri untuk mendukung rekomendasi SPK.",
  "Guru dapat memantau progress roadmap dan memberi bimbingan.",
];

function isEmail(value: string) {
  return value.includes("@");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function validateIdentifier(value: string) {
  const clean = value.trim();

  if (!clean) return "Username atau email wajib diisi.";
  if (clean.length < 3) return "Username/email terlalu pendek.";

  if (isEmail(clean) && !isValidEmail(clean)) {
    return "Format email belum valid.";
  }

  return "";
}

function getLoginErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("tidak ditemukan") ||
    lowerMessage.includes("password") ||
    lowerMessage.includes("401")
  ) {
    return "Akun tidak ditemukan atau password salah.";
  }

  if (
    lowerMessage.includes("failed to fetch") ||
    lowerMessage.includes("network") ||
    lowerMessage.includes("fetch")
  ) {
    return "Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.";
  }

  return message || "Login belum bisa diproses. Coba beberapa saat lagi.";
}

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [touchedUsername, setTouchedUsername] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const usernameError = touchedUsername ? validateIdentifier(username) : "";
  const passwordError =
    touchedPassword && !password ? "Password wajib diisi." : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTouchedUsername(true);
    setTouchedPassword(true);
    setError("");

    const identifierError = validateIdentifier(username);

    if (identifierError) {
      setError(identifierError);
      return;
    }

    if (!password) {
      setError("Password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        skipAuth: true,
        alert: false,
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      persistAuth(result.token, result.user, remember);

      // Untuk siswa, password default tidak lagi memblokir masuk dashboard.
      // Siswa akan mendapat dialog pengingat yang bisa ditutup di halaman siswa.
      if (result.user?.must_change_password && result.user.role !== "siswa") {
        router.replace("/auth/force-change-password");
        return;
      }

      router.replace(redirectPathByRole(result.user.role));
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.18),transparent_30%),linear-gradient(135deg,#07111f_0%,#0b1730_48%,#050b16_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute -left-32 top-28 h-80 w-80 rounded-full bg-cyan-400/20 blur-[110px]" />
      <div className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />

      <PublicNavbar />

      <section className="relative z-10 mx-auto flex min-h-screen w-[min(1080px,calc(100%-32px))] items-center justify-center pb-12 pt-32">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="relative hidden border-r border-white/10 p-8 lg:block">
            <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="grid h-13 w-13 place-items-center rounded-2xl bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-300/20">
                  <Icon name="target" className="h-6 w-6" />
                </div>

                <p className="mt-7 text-sm font-semibold text-cyan-200">
                  Proses bisnis SkillLens
                </p>

                <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-white">
                  Masuk untuk melanjutkan pengelolaan data dan bimbingan siswa.
                </h1>

                <p className="mt-4 text-sm font-medium leading-7 text-slate-300">
                  SkillLens membantu sekolah menghubungkan data akademik, profil
                  siswa, rekomendasi SPK, dan roadmap belajar dalam satu alur
                  yang lebih mudah dipantau.
                </p>

                <div className="mt-7 space-y-3">
                  {processItems.map((item) => (
                    <div
                      key={item}
                      className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4"
                    >
                      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cyan-300/15 text-cyan-200">
                        <Icon name="check" className="h-4 w-4" />
                      </div>

                      <p className="text-sm font-medium leading-6 text-slate-300">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-cyan-200/15 bg-cyan-300/10 p-4">
                <p className="text-sm font-medium leading-6 text-cyan-50">
                  Setelah login, sistem akan membuka dashboard sesuai akun yang
                  digunakan. Untuk siswa, jika password masih default, pengingat
                  ganti password akan tampil sebagai dialog yang bisa ditutup.
                </p>
              </div>
            </div>
          </aside>

          <section className="relative p-6 md:p-8 lg:p-10">
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />

            <div className="relative mx-auto max-w-md">
              <p className="text-sm font-semibold text-cyan-200">Form masuk</p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
                Selamat datang kembali
              </h2>

              <p className="mt-3 text-sm font-medium leading-7 text-slate-300">
                Masuk menggunakan username atau email yang sudah terdaftar.
              </p>

              <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-200">
                    <Icon name="profile" className="h-4 w-4 text-cyan-200" />
                    Username atau email
                  </span>

                  <input
                    value={username}
                    onBlur={() => setTouchedUsername(true)}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Masukkan username atau email"
                    autoComplete="username"
                    className={`w-full rounded-2xl border bg-white/10 px-4 py-4 text-sm font-medium !text-white caret-cyan-200 outline-none transition placeholder:text-slate-400 focus:bg-white/15 focus:ring-4 autofill:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.10)] autofill:[-webkit-text-fill-color:white] ${
                      usernameError
                        ? "border-rose-300/50 focus:border-rose-300 focus:ring-rose-300/10"
                        : "border-white/10 focus:border-cyan-300 focus:ring-cyan-300/10"
                    }`}
                  />

                  {usernameError ? (
                    <p className="mt-2 text-xs font-medium text-rose-200">
                      {usernameError}
                    </p>
                  ) : null}
                </label>

                <label className="block">
                  <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-200">
                    <Icon name="lock" className="h-4 w-4 text-cyan-200" />
                    Password
                  </span>

                  <div className="relative">
                    <input
                      value={password}
                      onBlur={() => setTouchedPassword(true)}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (error) setError("");
                      }}
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      autoComplete="current-password"
                      className={`w-full rounded-2xl border bg-white/10 px-4 py-4 pr-12 text-sm font-medium !text-white caret-cyan-200 outline-none transition placeholder:text-slate-400 focus:bg-white/15 focus:ring-4 autofill:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.10)] autofill:[-webkit-text-fill-color:white] ${
                        passwordError
                          ? "border-rose-300/50 focus:border-rose-300 focus:ring-rose-300/10"
                          : "border-white/10 focus:border-cyan-300 focus:ring-cyan-300/10"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute inset-y-0 right-3 flex items-center rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-cyan-200"
                      aria-label={
                        showPassword ? "Sembunyikan password" : "Lihat password"
                      }
                    >
                      <Icon
                        name={showPassword ? "eyeOff" : "eye"}
                        className="h-5 w-5"
                      />
                    </button>
                  </div>

                  {passwordError ? (
                    <p className="mt-2 text-xs font-medium text-rose-200">
                      {passwordError}
                    </p>
                  ) : null}
                </label>

                <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/10"
                    />
                    Ingat perangkat ini
                  </label>

                  <button
                    type="button"
                    onClick={() => router.push("/auth/forgot-password")}
                    className="text-left text-xs font-semibold text-cyan-200 transition hover:text-white sm:text-right"
                  >
                    Lupa kata sandi?
                  </button>
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-4 text-sm font-medium leading-6 text-rose-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-400/20 transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Icon name="rocket" className="h-4 w-4" />
                  {loading ? "Memeriksa akun..." : "Masuk ke dashboard"}
                </button>

                <p className="text-center text-sm font-medium text-slate-300">
                  Belum punya akun admin sekolah?{" "}
                  <Link
                    href="/auth/register"
                    className="font-semibold text-cyan-200 hover:text-white"
                  >
                    Daftar di sini
                  </Link>
                </p>
              </form>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}