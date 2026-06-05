"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { clearAuth, getStoredUser } from "../../lib/auth";
import { studentNav } from "../../config/navigation";
import { Icon } from "../ui/icons";

function getCurrentHash() {
  if (typeof window === "undefined") return "";
  return window.location.hash || "";
}

function normalizeHref(href?: string) {
  return href || "/siswa";
}

function isItemActive(href: string, pathname: string, hash: string) {
  if (href.includes("#")) {
    const [path, targetHash] = href.split("#");
    const expectedPath = path || "/siswa";
    return pathname === expectedPath && hash === `#${targetHash}`;
  }

  if (href === "/siswa") return pathname === "/siswa";

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "S"
  );
}

export function StudentTopNav({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [name, setName] = useState("Siswa");
  const [hash, setHash] = useState("");

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.role !== "siswa") {
      router.replace("/auth/login");
      return;
    }

    setName(user.nama || "Siswa");
  }, [router]);

  useEffect(() => {
    for (const item of studentNav) {
      const href = normalizeHref(item.href).split("#")[0];
      if (href) router.prefetch(href);
    }
  }, [router]);

  useEffect(() => {
    setHash(getCurrentHash());

    function handleHashChange() {
      setHash(getCurrentHash());
    }

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, hash]);

  const currentInitials = useMemo(() => getInitials(name), [name]);

  function handleNavClick(href?: string) {
    const target = normalizeHref(href);

    if (target.includes("#")) {
      const [, targetHash] = target.split("#");

      window.setTimeout(() => {
        setHash(getCurrentHash());
        document
          .querySelector(`#${targetHash}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } else {
      setHash("");
    }

    setMenuOpen(false);
  }

  function logout() {
    clearAuth();
    setLogoutOpen(false);
    router.replace("/auth/login");
  }

  return (
    <div className="min-h-screen text-slate-950 skilllens-blue-page">
      <header className="sticky top-0 z-50 overflow-hidden border-b border-sky-100/15 bg-[#07142f]/95 text-white shadow-sm shadow-blue-950/10 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_30%)]" />

        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5">
          <Link
            href="/siswa"
            onClick={() => setHash("")}
            className="group flex items-center gap-3"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/20 bg-white text-[#07142f] shadow-sm shadow-cyan-400/10 transition group-hover:-translate-y-0.5 group-hover:shadow-cyan-400/20">
              <Icon name="sparkles" className="h-5 w-5" />
            </div>

            <div className="leading-tight">
              <p className="text-base font-black tracking-tight text-white">
                SkillLens
              </p>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-cyan-200">
                Ruang Siswa
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.08] p-1 shadow-sm backdrop-blur-md lg:flex">
            {studentNav.map((item) => {
              const href = normalizeHref(item.href);
              const active = isItemActive(href, pathname, hash);

              return (
                <Link
                  key={item.key}
                  href={href}
                  prefetch
                  onClick={() => handleNavClick(href)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition duration-200 ${
                    active
                      ? "bg-white text-[#0a2f73] shadow-sm ring-1 ring-white/50"
                      : "text-sky-100/80 hover:bg-white/[0.12] hover:text-white"
                  }`}
                >
                  <Icon name={item.icon ?? "dashboard"} className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/siswa/akun"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold text-cyan-100 shadow-sm backdrop-blur-md transition hover:bg-white/15 hover:text-white"
            >
              <Icon name="settings" className="h-4 w-4" />
              Akun
            </Link>

            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 py-1.5 pl-2 pr-3 shadow-sm backdrop-blur-md">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-cyan-100 text-xs font-black text-[#07142f] ring-1 ring-white/40">
                {currentInitials}
              </div>

              <div className="leading-tight">
                <p className="max-w-32 truncate text-sm font-extrabold text-white">
                  {name}
                </p>
                <p className="text-[11px] font-bold text-cyan-100/70">
                  Siswa aktif
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:border-rose-400/30 hover:bg-rose-500 hover:text-white"
            >
              Keluar
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-sm transition hover:bg-white/20 lg:hidden"
            aria-label="Menu siswa"
            aria-expanded={menuOpen}
          >
            <Icon name={menuOpen ? "x" : "menu"} className="h-5 w-5" />
          </button>
        </div>

        {menuOpen && (
          <div className="relative border-t border-white/10 bg-[#07142f]/95 px-5 py-4 shadow-lg shadow-blue-950/20 backdrop-blur-xl lg:hidden">
            <div className="mx-auto max-w-7xl">
              <div className="mb-4 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/10 p-3 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-100 text-sm font-black text-[#07142f]">
                  {currentInitials}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-white">
                    {name}
                  </p>
                  <p className="text-xs font-bold text-cyan-100/70">
                    Ruang siswa SkillLens
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                {studentNav.map((item) => {
                  const href = normalizeHref(item.href);
                  const active = isItemActive(href, pathname, hash);

                  return (
                    <Link
                      key={item.key}
                      href={href}
                      prefetch
                      onClick={() => handleNavClick(href)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                        active
                          ? "bg-white text-[#0a2f73] shadow-lg shadow-cyan-400/10"
                          : "bg-white/[0.08] text-sky-100/80 hover:bg-white/[0.14] hover:text-white"
                      }`}
                    >
                      <Icon
                        name={item.icon ?? "dashboard"}
                        className="h-4 w-4"
                      />
                      {item.label}
                    </Link>
                  );
                })}

                <Link
                  href="/siswa/akun"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl bg-white/[0.08] px-4 py-3 text-sm font-bold text-sky-100/80 transition hover:bg-white/[0.14] hover:text-white"
                >
                  <Icon name="settings" className="h-4 w-4" />
                  Profil
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setLogoutOpen(true);
                  }}
                  className="mt-2 flex items-center gap-3 rounded-2xl bg-rose-500/12 px-4 py-3 text-left text-sm font-bold text-rose-100 transition hover:bg-rose-500 hover:text-white"
                >
                  <Icon name="logout" className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {children}

      {logoutOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-900/30 px-4 py-6">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-2xl shadow-slate-950/20">
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 p-7">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.045)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-200/25 blur-3xl" />
              <div className="pointer-events-none absolute -left-16 bottom-0 h-36 w-36 rounded-full bg-sky-200/20 blur-3xl" />

              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Tutup konfirmasi keluar"
              >
                <Icon name="x" className="h-4 w-4" />
              </button>

              <div className="relative z-10 grid h-16 w-16 place-items-center rounded-3xl border border-rose-100 bg-white text-rose-600 shadow-sm shadow-rose-100/60">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                  <Icon name="logout" className="h-5 w-5" />
                </div>
              </div>

              <h2 className="relative z-10 mt-6 text-2xl font-black tracking-tight text-slate-950">
                Keluar dari akun?
              </h2>

              <p className="relative z-10 mt-3 text-sm font-medium leading-6 text-slate-600">
                Kamu akan keluar dari ruang siswa dan perlu login kembali untuk
                mengakses rekomendasi serta roadmap.
              </p>

              <div className="relative z-10 mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setLogoutOpen(false)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-rose-600/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Ya, keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
