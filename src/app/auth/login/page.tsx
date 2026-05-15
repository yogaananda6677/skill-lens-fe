"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/axios";
import { AppShell } from "../../../components/layout/AppShell";
import { Icon } from "../../../components/ui/icons";

type LoginResponse = {
  token: string;
  user: {
    id: number;
    nama: string;
    email?: string;
    username: string;
    role: "superadmin" | "admin" | "guru" | "siswa";
  };
};

function getRedirectPath(role: LoginResponse["user"]["role"]) {
  if (role === "superadmin") return "/superadmin/admin";
  if (role === "admin") return "/admin/dashboard";
  if (role === "guru") return "/guru";
  if (role === "siswa") return "/siswa";
  return "/";
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const identifier = username.trim();

    if (!identifier || !password) {
      setError("Email/username dan password wajib diisi.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const data = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: identifier, password }),
      });

      localStorage.setItem("skilllens_token", data.token);
      localStorage.setItem("skilllens_user", JSON.stringify(data.user));

      if (rememberDevice) {
        localStorage.setItem("skilllens_remember", "true");
      } else {
        localStorage.removeItem("skilllens_remember");
      }

      router.replace(getRedirectPath(data.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal. Periksa email/username dan password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppShell
      active="auth"
      eyebrow="Login SkillLens"
      title="Masuk ke workspace SkillLens."
      description="Gunakan akun yang sudah terdaftar untuk membuka dashboard sesuai peran pengguna."
    >
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.88fr]">
        <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-8">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#0f2a5f]">Form masuk</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Akses dashboard dengan akun aktif</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">Masukkan email atau username dan password untuk melanjutkan.</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <Icon name="mail" className="h-4 w-4 text-slate-500" />
                Email / username
              </span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none transition focus:border-[#0f2a5f] focus:bg-white"
                placeholder="Masukkan email atau username"
              />
            </label>

            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <Icon name="lock" className="h-4 w-4 text-slate-500" />
                Password
              </span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none transition focus:border-[#0f2a5f] focus:bg-white"
                placeholder="Masukkan password"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(event) => setRememberDevice(event.target.checked)}
                  className="h-4 w-4 accent-[#0f2a5f]"
                />
                Ingat perangkat ini
              </label>

              <span className="text-sm font-medium text-slate-500">Hubungi admin jika lupa password</span>
            </div>

            {error && <div className="rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700 ring-1 ring-rose-100">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-medium text-white shadow-xl shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-[#0f2a5f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="dashboard" className="h-4 w-4" />
              {isLoading ? "Memeriksa akun..." : "Masuk ke dashboard"}
            </button>
          </form>

          <div className="mt-8 rounded-[1.5rem] bg-slate-50 p-5">
            <p className="font-medium text-slate-950">Belum memiliki akun guru?</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">Daftar terlebih dahulu, lalu lanjutkan pengajuan atau pemilihan sekolah setelah login.</p>
            <Link href="/auth/register" className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-[#0f2a5f] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#eef5ff]">Daftar akun guru</Link>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10 md:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">Hak akses</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Tampilan menyesuaikan peran akun.</h2>
            <div className="mt-6 space-y-3">
              {[
                ["Superadmin", "Mengelola akun admin dan memantau sistem.", "shield"],
                ["Admin", "Memverifikasi sekolah yang diajukan.", "verify"],
                ["Guru", "Mengelola data siswa dan proses sekolah.", "school"],
                ["Siswa", "Melihat hasil dan roadmap pengembangan diri.", "roadmap"],
              ].map(([title, text, icon]) => (
                <div key={title} className="flex gap-4 rounded-[1.25rem] border border-white/10 bg-white/8 p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-cyan-200">
                    <Icon name={icon as never} className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#0f2a5f]">Informasi login</p>
            <div className="mt-5 space-y-4">
              {[
                "Akun guru dibuat melalui halaman pendaftaran guru.",
                "Akun siswa dibuat oleh sekolah saat data siswa diproses.",
                "Akun admin dan superadmin dikelola dari sistem internal.",
              ].map((item, index) => (
                <div key={item} className="flex gap-4 rounded-[1.25rem] bg-slate-50 p-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#0f2a5f] text-sm font-medium text-white">{index + 1}</div>
                  <p className="text-sm font-medium leading-6 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
