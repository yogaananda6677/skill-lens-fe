// src/components/layout/DashboardShell.tsx

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  clearAuth,
  getStoredUser,
  redirectPathByRole,
  type AuthRole,
} from "../../lib/auth";
import { Icon } from "../ui/icons";

export type DashboardNavItem = {
  key: string;
  label: string;
  description?: string;
  href?: string;
  icon?: string;
  badge?: string;
  roles?: readonly AuthRole[];
};

type DashboardShellProps = {
  activeKey: string;
  navItems: readonly DashboardNavItem[];
  title: string;
  subtitle: string;
  userName?: string;
  userLabel?: string;
  schoolName?: string;
  requiredRole?: AuthRole | AuthRole[];
  children: ReactNode;
  onNavigate?: (key: string) => void;
  rightSlot?: ReactNode;
};

function roleLabel(role?: string) {
  if (role === "superadmin") return "Superadmin";
  if (role === "admin") return "Administrator";
  if (role === "admin_sekolah") return "Admin Sekolah";
  if (role === "guru") return "Guru";
  if (role === "siswa") return "Siswa";
  return "Pengguna";
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "SL"
  );
}

function navIsActive(
  item: DashboardNavItem,
  activeKey: string,
  pathname: string,
) {
  if (item.key === activeKey) return true;
  if (item.href && !item.href.includes("#") && item.href === pathname) {
    return true;
  }
  return false;
}

function LogoutModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
        aria-label="Tutup modal logout"
      />

      <div className="relative w-full max-w-md animate-[modalIn_180ms_ease-out] overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-950/10">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-950"
          aria-label="Batal logout"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-sky-50 via-white to-white px-6 pb-5 pt-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/15">
            <Icon name="logout" className="h-5 w-5" />
          </div>

          <h2 className="mt-5 text-xl font-black tracking-tight text-slate-950">
            Keluar dari SkillLens?
          </h2>

          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            Sesi akan diakhiri dan kamu perlu login kembali untuk mengakses
            dashboard.
          </p>
        </div>

        <div className="grid gap-3 border-t border-slate-100 p-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-rose-600/15 transition hover:bg-rose-700"
          >
            Ya, logout
          </button>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  item,
  active,
  onClick,
}: {
  item: DashboardNavItem;
  active: boolean;
  onClick: () => void;
}) {
  const icon = item.icon ?? "dashboard";

  const className = [
    "group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 text-left outline-none transition-all duration-300 ease-out",
    "focus-visible:ring-2 focus-visible:ring-cyan-200/80",
    active
      ? "bg-slate-100 text-slate-900 shadow-[0_14px_34px_rgba(0,0,0,0.08)]"
      : "text-slate-500 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md",
  ].join(" ");

  const content = (
    <>
      <span
        className={`absolute bottom-3 left-0 top-3 w-1 rounded-r-full transition-all duration-300 ${
          active ? "bg-cyan-500 opacity-100" : "bg-transparent opacity-0"
        }`}
      />

      <span
        className={`absolute inset-0 opacity-0 transition-opacity duration-300 ${
          active
            ? "bg-gradient-to-r from-cyan-50/80 via-white to-white opacity-100"
            : "group-hover:bg-gradient-to-r group-hover:from-slate-100 group-hover:to-transparent group-hover:opacity-100"
        }`}
      />

      <span
        className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition-all duration-300 ${
          active
            ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
            : "bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-700"
        }`}
      >
        <Icon name={icon as any} className="h-[18px] w-[18px]" />
      </span>

      <span className="relative z-10 min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">{item.label}</span>

        {item.description && (
          <span
            className={`mt-0.5 block truncate text-xs font-medium transition-colors ${
              active ? "text-slate-600" : "text-slate-400 group-hover:text-slate-600"
            }`}
          >
            {item.description}
          </span>
        )}
      </span>

      {item.badge ? (
        <span
          className={`relative z-10 rounded-full px-2 py-0.5 text-[10px] font-black transition-colors ${
            active ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {item.badge}
        </span>
      ) : (
        <Icon
          name="chevronRight"
          className={`relative z-10 h-4 w-4 transition-all duration-300 ${
            active
              ? "translate-x-0 text-sky-500"
              : "text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600"
          }`}
        />
      )}
    </>
  );

  if (item.href && !item.href.startsWith("#")) {
    return (
      <Link
        href={item.href}
        onClick={onClick}
        id={`dashboard-nav-${item.key}`}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      id={`dashboard-nav-${item.key}`}
      className={className}
    >
      {content}
    </button>
  );
}

export function DashboardShell({
  activeKey,
  navItems,
  title,
  subtitle,
  userName,
  userLabel,
  schoolName: _schoolName,
  requiredRole,
  children,
  onNavigate,
  rightSlot,
}: DashboardShellProps) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [routeSwitching, setRouteSwitching] = useState(false);
  const [storedUser, setStoredUser] =
    useState<ReturnType<typeof getStoredUser>>(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    setStoredUser(user);

    const allowed = Array.isArray(requiredRole)
      ? requiredRole
      : requiredRole
        ? [requiredRole]
        : [];

    if (allowed.length && (!user || !allowed.includes(user.role))) {
      router.replace(redirectPathByRole(user?.role));
      return;
    }

    setReady(true);
  }, [requiredRole, router]);

  useEffect(() => {
    setOpen(false);

    const timeout = window.setTimeout(() => {
      setRouteSwitching(false);
    }, 140);

    return () => window.clearTimeout(timeout);
  }, [pathname, activeKey]);

  const visibleNav = useMemo(
    () =>
      navItems.filter(
        (item) =>
          !item.roles?.length ||
          (storedUser?.role && item.roles.includes(storedUser.role)),
      ),
    [navItems, storedUser?.role],
  );

  const displayName = userName || storedUser?.nama || "Pengguna";
  const displayLabel = userLabel || roleLabel(storedUser?.role);

  function logout() {
    clearAuth();
    setLogoutOpen(false);
    router.replace("/auth/login");
  }

  function navigate(item: DashboardNavItem) {
    onNavigate?.(item.key);

    if (item.href?.includes("#")) {
      const hash = item.href.split("#")[1];

      window.setTimeout(() => {
        document
          .getElementById(hash)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 30);

      return;
    }

    if (item.href && item.href !== pathname) {
      setRouteSwitching(true);
    }
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-50 via-white to-sky-50/40 text-sm font-bold text-slate-500">
        <div className="rounded-3xl border border-sky-100 bg-white px-6 py-4 shadow-lg shadow-sky-100/60">
          Memeriksa akses akun...
        </div>
      </main>
    );
  }

  const sidebar = (
    <aside className="flex h-full min-h-screen w-full flex-col bg-white text-slate-800 shadow-lg">
      {/* Logo dan nama */}
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3 rounded-2xl p-2">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-600 text-white shadow-md">
            <Icon name="spark" className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-black tracking-tight text-slate-800">
              SkillLens
            </p>
            <p className="truncate text-[11px] font-black uppercase tracking-[0.18em] text-sky-600">
              {roleLabel(storedUser?.role)} panel
            </p>
          </div>
        </div>
      </div>

      {/* Profil pengguna */}
      <div className="px-5 pt-5">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition duration-300 hover:bg-slate-100">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sm font-black text-sky-800 shadow-sm">
              {initials(displayName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">
                {displayName}
              </p>
              <p className="truncate text-xs font-medium text-slate-500">
                {displayLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigasi menu */}
      <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-4 pb-4">
        {visibleNav.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            active={navIsActive(item, activeKey, pathname)}
            onClick={() => navigate(item)}
          />
        ))}
      </nav>

      {/* Tombol logout */}
      <div className="border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
        >
          <Icon name="logout" className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <main className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/40 text-slate-950 lg:grid lg:grid-cols-[292px_1fr]">
        <div className="pointer-events-none fixed inset-0 bg-[repeating-linear-gradient(45deg,_rgba(14,116,144,0.018)_0px,_rgba(14,116,144,0.018)_1px,_transparent_1px,_transparent_24px)]" />

        {routeSwitching && (
          <div className="fixed left-0 right-0 top-0 z-[100] h-1 overflow-hidden bg-sky-100">
            <div className="h-full w-1/2 animate-[routeProgress_720ms_ease-in-out_infinite] rounded-r-full bg-gradient-to-r from-sky-500 to-cyan-400" />
          </div>
        )}

        <div className="hidden lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto bg-white shadow-lg">
            {sidebar}
          </div>
        </div>

        <div className="lg:hidden">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-md">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              aria-label="Buka menu"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-base font-black text-slate-800">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-600 text-white shadow-sm">
                <Icon name="spark" className="h-4 w-4" />
              </span>
              SkillLens
            </div>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-50 text-rose-600 transition hover:bg-rose-100"
              aria-label="Keluar"
            >
              <Icon name="logout" className="h-4 w-4" />
            </button>
          </header>

          {open && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
                aria-label="Tutup menu"
              />
              <div className="relative h-full w-[86%] max-w-sm animate-[sidebarIn_240ms_ease-out] shadow-2xl">
                {sidebar}
              </div>
            </div>
          )}
        </div>

        <section className="min-w-0">
          <div className="w-full px-5 py-5 lg:px-6">
            <header className="relative mb-6 overflow-hidden rounded-[1.6rem] border border-sky-100 bg-[#0f2d5a] text-white shadow-xl shadow-sky-950/10">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-400/20 via-transparent to-cyan-300/10" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:34px_34px]" />
              <div className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-sky-400/20 blur-3xl" />

              <div className="relative px-6 py-7 md:px-8 md:py-8">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                  <Icon name="spark" className="h-3.5 w-3.5" />
                  {roleLabel(storedUser?.role)}
                </p>
                <h1 className="mt-4 text-2xl font-black tracking-tight text-white md:text-4xl">
                  {title || "Dashboard Administrasi"}
                </h1>
                {subtitle && (
                  <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-sky-100/90 md:text-[15px]">
                    {subtitle}
                  </p>
                )}
                {rightSlot && <div className="mt-5">{rightSlot}</div>}
              </div>
            </header>

            <div
              key={`${pathname}-${activeKey}`}
              className={[
                "transition-all duration-300 ease-out",
                routeSwitching
                  ? "translate-y-2 opacity-0 blur-[1px]"
                  : "translate-y-0 opacity-100 blur-0 animate-[contentIn_280ms_ease-out]",
              ].join(" ")}
            >
              {children}
            </div>
          </div>
        </section>
      </main>

      <LogoutModal
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={logout}
      />

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes contentIn {
          from {
            opacity: 0;
            transform: translateY(12px);
            filter: blur(1px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes sidebarIn {
          from {
            opacity: 0;
            transform: translateX(-18px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes routeProgress {
          0% {
            transform: translateX(-120%);
          }
          55% {
            transform: translateX(75%);
          }
          100% {
            transform: translateX(240%);
          }
        }
      `}</style>
    </>
  );
}