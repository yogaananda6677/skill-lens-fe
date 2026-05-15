"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Icon } from "../ui/icons";
import { clearAuth } from "../../lib/auth";

type AppShellProps = {
  active?: "home" | "guru" | "siswa" | "admin" | "superadmin" | "auth";
  role?: "superadmin" | "admin" | "guru" | "siswa";
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
  { href: "/guru/sekolah", label: "Sekolah" },
  { href: "/guru/import", label: "Import" },
  { href: "/guru/bimbingan", label: "Bimbingan" },
] as const;

function getNavByRole(role?: AppShellProps["role"]) {
  if (role === "superadmin") return superadminNav;
  if (role === "admin") return adminNav;
  if (role === "guru") return guruNav;
  return publicNav;
}

function getDashboardHome(role?: AppShellProps["role"]) {
  if (role === "superadmin") return "/superadmin/admin";
  if (role === "admin") return "/admin/dashboard";
  if (role === "guru") return "/guru";
  return "/";
}

function PublicLogoutModal({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center px-4 py-6">
      <button className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={onCancel} aria-label="Tutup modal logout" />
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_28px_90px_rgba(15,23,42,0.32)]">
        <button type="button" onClick={onCancel} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-950" aria-label="Batal logout">
          <Icon name="x" className="h-4 w-4" />
        </button>
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <Icon name="alert" className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">Keluar dari SkillLens?</h2>
        <p className="mt-3 text-sm font-medium leading-7 text-slate-500">Sesi akan diakhiri dan kamu akan diarahkan ke halaman login.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">Batal</button>
          <button type="button" onClick={onConfirm} className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700">Ya, Logout</button>
        </div>
      </div>
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
