"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../../components/layout/AppShell";
import { apiFetch } from "../../../lib/axios";
import { Icon } from "../../../components/ui/icons";

const teacherRoles = ["Guru BK", "Wali Kelas", "Kepala Program Keahlian", "Admin Sekolah"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    nip: "",
    jabatan: teacherRoles[0],
    no_hp: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <AppShell
      active="auth"
      eyebrow="Pendaftaran Guru"
      title="Buat akun guru dengan tampilan yang lebih ringkas."
      description="Isi data akun terlebih dahulu. Pengajuan atau pemilihan sekolah dilakukan setelah berhasil login."
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-700">Identitas guru</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Data akun dan profil singkat</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">Lengkapi data dengan format yang rapi agar proses masuk ke sistem lebih mudah.</p>
            </div>
            <span className="rounded-full bg-sky-50 px-4 py-2 text-xs font-medium text-sky-700">Akun aktif setelah berhasil dibuat</span>
          </div>

          <form
            className="mt-8 grid gap-4 md:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              setMessage("");

              if (form.password !== form.password_confirmation) {
                setError("Konfirmasi password tidak sesuai.");
                return;
              }

              setIsLoading(true);
              try {
                const result = await apiFetch<{ message: string }>("/auth/register-guru", {
                  method: "POST",
                  body: JSON.stringify({
                    nama: form.nama,
                    nip: form.nip,
                    jabatan: form.jabatan,
                    no_hp: form.no_hp,
                    username: form.username,
                    email: form.email,
                    password: form.password,
                  }),
                });
                setMessage(result.message || "Akun guru berhasil dibuat.");
                setTimeout(() => router.push("/auth/login"), 900);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Pendaftaran gagal diproses.");
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700"><Icon name="user" className="h-4 w-4 text-slate-500" />Nama lengkap</span>
              <input value={form.nama} onChange={(event) => update("nama", event.target.value)} placeholder="Masukkan nama lengkap" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none transition focus:border-sky-700 focus:bg-white" />
            </label>

            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700"><Icon name="check" className="h-4 w-4 text-slate-500" />NIP / NUPTK</span>
              <input value={form.nip} onChange={(event) => update("nip", event.target.value)} placeholder="Masukkan NIP / NUPTK" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none transition focus:border-sky-700 focus:bg-white" />
            </label>

            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700"><Icon name="guidance" className="h-4 w-4 text-slate-500" />Jabatan</span>
              <select value={form.jabatan} onChange={(event) => update("jabatan", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none transition focus:border-sky-700 focus:bg-white">
                {teacherRoles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700"><Icon name="phone" className="h-4 w-4 text-slate-500" />Nomor HP</span>
              <input value={form.no_hp} onChange={(event) => update("no_hp", event.target.value)} placeholder="Masukkan nomor HP" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none transition focus:border-sky-700 focus:bg-white" />
            </label>

            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700"><Icon name="profile" className="h-4 w-4 text-slate-500" />Username</span>
              <input value={form.username} onChange={(event) => update("username", event.target.value)} placeholder="Masukkan username" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none transition focus:border-sky-700 focus:bg-white" />
            </label>

            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700"><Icon name="mail" className="h-4 w-4 text-slate-500" />Email aktif</span>
              <input value={form.email} onChange={(event) => update("email", event.target.value)} type="email" placeholder="Masukkan email aktif" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none transition focus:border-sky-700 focus:bg-white" />
            </label>

            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700"><Icon name="lock" className="h-4 w-4 text-slate-500" />Password</span>
              <input value={form.password} onChange={(event) => update("password", event.target.value)} type="password" placeholder="Masukkan password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none transition focus:border-sky-700 focus:bg-white" />
            </label>

            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700"><Icon name="lock" className="h-4 w-4 text-slate-500" />Konfirmasi password</span>
              <input value={form.password_confirmation} onChange={(event) => update("password_confirmation", event.target.value)} type="password" placeholder="Ulangi password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none transition focus:border-sky-700 focus:bg-white" />
            </label>

            {(message || error) && (
              <div className={`rounded-2xl p-4 text-sm font-medium leading-6 md:col-span-2 ${error ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100" : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"}`}>
                {error || message}
              </div>
            )}

            <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
              <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-medium text-white shadow-xl shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-sky-800 disabled:opacity-60">
                <Icon name="rocket" className="h-4 w-4" />
                {isLoading ? "Mendaftarkan..." : "Daftar akun"}
              </button>

              <Link href="/auth/login" className="rounded-full border border-slate-200 bg-white px-6 py-4 text-center text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-800">
                Sudah punya akun
              </Link>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10 md:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">Setelah daftar</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Hubungkan akun ke sekolah</h2>
            <p className="mt-4 text-sm leading-7 text-slate-200">Setelah login, guru dapat memilih sekolah yang tersedia atau mengajukan sekolah baru. Fitur pengelolaan aktif setelah sekolah diverifikasi admin.</p>
          </section>

          <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-700">Alur pendaftaran</p>
            <div className="mt-5 space-y-4">
              {[
                "Guru membuat akun dengan data identitas dasar.",
                "Guru login lalu memilih atau mengajukan sekolah.",
                "Admin memverifikasi sekolah sebelum fitur akademik aktif.",
              ].map((item, index) => (
                <div key={item} className="flex gap-4 rounded-2xl bg-slate-50 p-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-800 text-sm font-medium text-white">{index + 1}</div>
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
