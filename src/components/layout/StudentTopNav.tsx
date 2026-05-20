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
    }

    setMenuOpen(false);
  }

  function logout() {
    clearAuth();
    setLogoutOpen(false);
    router.replace("/auth/login");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_45%,#f8fafc_100%)] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-sky-100 bg-white/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5">
          <Link
            href="/siswa"
            onClick={() => setHash("")}
            className="flex items-center gap-3"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-600/20">
              <Icon name="sparkles" className="h-5 w-5" />
            </div>

            <div className="leading-tight">
              <p className="text-base font-bold tracking-tight text-slate-950">
                SkillLens
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
                Ruang Siswa
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-sky-100 bg-sky-50/70 p-1 lg:flex">
            {studentNav.map((item) => {
              const href = normalizeHref(item.href);
              const active = isItemActive(href, pathname, hash);

              return (
                <Link
                  key={item.key}
                  href={href}
                  onClick={() => handleNavClick(href)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-white text-sky-700 shadow-sm ring-1 ring-sky-100"
                      : "text-slate-600 hover:bg-white/80 hover:text-sky-700"
                  }`}
                >
                  <Icon name={item.icon ?? "dashboard"} className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex items-center gap-3 rounded-full border border-sky-100 bg-white px-3 py-2 shadow-sm">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                {currentInitials}
              </div>

              <div className="pr-1 leading-tight">
                <p className="max-w-32 truncate text-sm font-bold text-slate-800">
                  {name}
                </p>
                <p className="text-[11px] font-semibold text-slate-400">
                  Siswa
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="rounded-full border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white"
            >
              Keluar
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-sky-100 bg-white text-slate-700 shadow-sm transition hover:bg-sky-50 lg:hidden"
            aria-label="Menu siswa"
          >
            <Icon name={menuOpen ? "x" : "menu"} className="h-5 w-5" />
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-sky-100 bg-white/95 px-5 py-4 shadow-lg shadow-sky-950/5 lg:hidden">
            <div className="mx-auto max-w-7xl">
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-sky-50 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-600 text-sm font-bold text-white">
                  {currentInitials}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">{name}</p>
                  <p className="text-xs font-semibold text-slate-500">
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
                      onClick={() => handleNavClick(href)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                        active
                          ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                          : "bg-slate-50 text-slate-700 hover:bg-sky-50 hover:text-sky-700"
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

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setLogoutOpen(true);
                  }}
                  className="mt-2 flex items-center gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-left text-sm font-bold text-rose-600"
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
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <Icon name="logout" className="h-5 w-5" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Keluar dari akun?
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              Kamu akan keluar dari ruang siswa dan perlu login kembali untuk
              mengakses rekomendasi serta roadmap.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
              >
                Ya, keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}