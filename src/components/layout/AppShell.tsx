"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Icon } from "../ui/icons";
import { clearAuth, type AuthRole } from "../../lib/auth";

type AppShellProps = {
  active?: "home" | "guru" | "siswa" | "admin" | "superadmin" | "auth";
  role?: AuthRole;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
};

const publicNav = [
  { href: "/#fitur", label: "Fitur" },
  { href: "/#alur", label: "Alur" },
  { href: "/#metode", label: "Metode" },
  { href: "/#kontak", label: "Bantuan" },
] as const;

const superadminNav = [
  { href: "/superadmin/admin", label: "Kelola Admin" },
] as const;

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/verifikasi", label: "Verifikasi" },
  { href: "/admin/sekolah", label: "Sekolah" },
] as const;

const guruNav = [
  { href: "/guru", label: "Dashboard" },
  { href: "/guru#school", label: "Sekolah" },
  { href: "/guru#import", label: "Import" },
  { href: "/guru#guidance", label: "Bimbingan" },
] as const;

function getNavByRole(role?: AppShellProps["role"]) {
  if (role === "superadmin") return superadminNav;
  if (role === "admin") return adminNav;
  if (role === "admin_sekolah") return guruNav;
  if (role === "guru") return guruNav;
  return publicNav;
}

function getDashboardHome(role?: AppShellProps["role"]) {
  if (role === "superadmin") return "/superadmin/admin";
  if (role === "admin") return "/admin/dashboard";
  if (role === "admin_sekolah") return "/guru";
  if (role === "guru") return "/guru";
  return "/";
}

function PublicLogoutModal({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/58 px-4 py-6 text-slate-950 backdrop-blur-[4px]">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onCancel} aria-label="Tutup modal logout" />
      <section className="relative w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/30 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.35)]">
        <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-r from-[#0b2450] via-[#0d3c70] to-sky-600 px-6 py-5 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-100">Konfirmasi Akun</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Keluar dari SkillLens?</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-sky-100/90">Sesi akan diakhiri dan kamu akan diarahkan ke halaman login.</p>
            </div>
            <button type="button" onClick={onCancel} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20" aria-label="Batal logout">
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
              <h3 className="text-sm font-extrabold text-slate-900">Konfirmasi logout</h3>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">Pastikan pekerjaan yang belum tersimpan sudah disimpan sebelum keluar dari akun.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white/95 px-6 py-4 shadow-[0_-12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Batal</button>
            <button type="button" onClick={onConfirm} className="rounded-2xl bg-gradient-to-r from-[#0b2450] to-sky-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition hover:-translate-y-0.5">Ya, keluar</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function AppShell({
  role,
  eyebrow,
  title,
  description,
  children,
}: AppShellProps) {
  const navItems = getNavByRole(role);
  const homeHref = getDashboardHome(role);
  const isDashboard = Boolean(role);
  const [logoutOpen, setLogoutOpen] = useState(false);

  function confirmLogout() {
    clearAuth();
    window.location.href = "/auth/login";
  }

  return (
    <main className="min-h-screen bg-transparent text-slate-950">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-white/85 backdrop-blur-2xl">
        <nav className="mx-auto flex w-[min(1220px,calc(100%-32px))] items-center justify-between gap-4 py-4">
          <Link href={homeHref} className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15">
              <Icon name="spark" className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-base font-semibold tracking-tight">SkillLens</p>
              <p className="text-xs font-semibold text-slate-500">
                {isDashboard ? "Workspace" : "Career Decision Support"}
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-sm font-semibold text-slate-500 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-slate-950">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isDashboard ? (
              <button
                type="button"
                onClick={() => setLogoutOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-600 hover:text-white"
              >
                <Icon name="logout" className="h-4 w-4" />
                Keluar
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 sm:inline-flex"
                >
                  Masuk
                </Link>

                <Link
                  href="/auth/register"
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Daftar Guru
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {(title || description || eyebrow) && (
        <section className="relative overflow-hidden px-4 pb-14 pt-32 text-white md:pb-18 md:pt-36">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#081225_0%,#0f1f46_45%,#14356b_100%)]" />
          <div className="absolute inset-0 opacity-45">
            <div className="absolute left-[-120px] top-[-180px] h-[380px] w-[380px] rounded-full bg-sky-500 blur-[120px]" />
            <div className="absolute bottom-[-180px] right-[-80px] h-[460px] w-[460px] rounded-full bg-cyan-400 blur-[140px]" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:72px_72px]" />

          <div className="relative z-10 mx-auto w-[min(1220px,calc(100%-32px))]">
            {eyebrow && (
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_16px_rgba(125,211,252,0.9)]" />
                {eyebrow}
              </div>
            )}

            {title && (
              <h1 className="max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
                {title}
              </h1>
            )}

            {description && (
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                {description}
              </p>
            )}
          </div>
        </section>
      )}

      <div className="mx-auto w-[min(1220px,calc(100%-32px))] py-8 md:py-12">{children}</div>
      <PublicLogoutModal open={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={confirmLogout} />
    </main>
  );
}
