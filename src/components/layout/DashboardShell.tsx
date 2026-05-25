"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Tutup modal logout"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-950"
          aria-label="Batal logout"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-sky-50 to-white px-6 pb-5 pt-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/20">
            <Icon name="logout" className="h-5 w-5" />
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            Keluar dari SkillLens?
          </h2>

          <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
            Sesi akan diakhiri dan kamu perlu login kembali untuk mengakses
            dashboard.
          </p>
        </div>

        <div className="grid gap-3 border-t border-slate-100 p-6 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
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
    "group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-300",
    active
      ? "bg-sky-50 text-slate-950 ring-1 ring-sky-100"
      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
  ].join(" ");

  const content = (
    <>
      <span
        className={`absolute bottom-3 left-0 top-3 w-1 rounded-r-full transition-all duration-300 ${
          active ? "bg-sky-600 opacity-100" : "bg-transparent opacity-0"
        }`}
      />

      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all duration-300 ${
          active
            ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
            : "bg-slate-100 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-700"
        }`}
      >
        <Icon name={icon as any} className="h-[18px] w-[18px]" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {item.label}
        </span>

        {item.description && (
          <span
            className={`mt-0.5 block truncate text-xs font-medium ${
              active ? "text-sky-700/70" : "text-slate-400"
            }`}
          >
            {item.description}
          </span>
        )}
      </span>

      {item.badge ? (
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">
          {item.badge}
        </span>
      ) : (
        <Icon
          name="chevronRight"
          className={`h-4 w-4 transition ${
            active
              ? "text-sky-500"
              : "text-slate-300 group-hover:text-slate-500"
          }`}
        />
      )}
    </>
  );

  if (item.href && !item.href.startsWith("#")) {
    return (
      <Link href={item.href} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
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
  const [helpOpen, setHelpOpen] = useState(false);
  const [storedUser, setStoredUser] =
    useState<ReturnType<typeof getStoredUser>>(null);

  const helpRef = useRef<HTMLDivElement>(null);
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
  }, [pathname, activeKey]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setHelpOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    }
  }

  function handleHelp() {
    alert("Bantuan: Silakan lihat panduan penggunaan di menu 'Help and Feedback'.");
  }

  function handleAskCommunity() {
    window.open("https://github.com/", "_blank");
  }

  function handleSendFeedback() {
    window.location.href =
      "mailto:feedback@skilllens.com?subject=Feedback SkillLens";
  }

  function handleWhatsNew() {
    alert(
      "Fitur baru: Dashboard interaktif, import nilai langsung dari Excel, rekomendasi karier berbobot.",
    );
  }

  function handleHelpAndFeedback() {
    alert(
      "📘 Panduan Penggunaan\n\n1. Ajukan Data Sekolah\n2. Tunggu Verifikasi\n3. Kelola Jurusan\n4. Tambah Guru\n5. Import Siswa\n6. Lihat Data Siswa & Nilai\n7. Mata Pelajaran",
    );
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-slate-500">
        Memeriksa akses akun...
      </main>
    );
  }

  const sidebar = (
    <aside className="flex min-h-screen flex-col overflow-hidden border-r border-slate-200 bg-white/92 text-slate-950 backdrop-blur-xl">
      <div className="border-b border-slate-100 px-5 py-5">
        <Link
          href={redirectPathByRole(storedUser?.role)}
          className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-sky-50"
        >
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/20">
            <Icon name="spark" className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-slate-950">
              SkillLens
            </p>

            <p className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-sky-700/70">
              {roleLabel(storedUser?.role)} panel
            </p>
          </div>
        </Link>
      </div>

      <div className="px-5 pt-5">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/70 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sm font-bold text-sky-700 ring-1 ring-sky-200">
              {initials(displayName)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">
                {displayName}
              </p>

              <p className="truncate text-xs font-medium text-slate-500">
                {displayLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

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

      <div className="border-t border-slate-100 p-4">
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-600 hover:text-white"
        >
          <Icon name="logout" className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <main className="min-h-screen bg-[#f6f9ff] text-slate-950 lg:grid lg:grid-cols-[292px_1fr]">
        <div className="hidden lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto border-r border-slate-200 bg-white">
            {sidebar}
          </div>
        </div>

        <div className="lg:hidden">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                aria-label="Buka menu"
              >
                <Icon name="menu" />
              </button>

              <Link
                href={redirectPathByRole(storedUser?.role)}
                className="flex items-center gap-2 text-base font-bold"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-600 text-white">
                  <Icon name="spark" className="h-4 w-4" />
                </span>
                SkillLens
              </Link>

              <button
                type="button"
                onClick={() => setLogoutOpen(true)}
                className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100"
                aria-label="Keluar"
              >
                <Icon name="logout" className="h-4 w-4" />
              </button>
            </div>
          </header>

          {open && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
                aria-label="Tutup menu"
              />

              <div className="relative h-full w-[86%] max-w-sm animate-[sidebarIn_220ms_ease-out] shadow-2xl">
                {sidebar}
              </div>
            </div>
          )}
        </div>

        <section className="min-w-0">
          <div className="w-full px-5 py-5 lg:px-6">
            <div className="mb-6 flex items-center justify-end gap-4">
              <div className="relative" ref={helpRef}>
                <button
                  type="button"
                  onClick={() => setHelpOpen(!helpOpen)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  <Icon name="help" className="h-4 w-4" />
                  <span>Help</span>
                </button>

                {helpOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg">
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={handleHelp}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Icon name="help" className="h-4 w-4 text-slate-400" />
                        <span>Help</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAskCommunity}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Icon name="users" className="h-4 w-4 text-slate-400" />
                        <span>Ask the Help Community</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSendFeedback}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Icon name="mail" className="h-4 w-4 text-slate-400" />
                        <span>Send feedback to Google</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleWhatsNew}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Icon
                          name="sparkles"
                          className="h-4 w-4 text-slate-400"
                        />
                        <span>What's new in Classroom</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleHelpAndFeedback}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Icon
                          name="message"
                          className="h-4 w-4 text-slate-400"
                        />
                        <span>Help and Feedback</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="relative grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
                aria-label="Notifikasi"
              >
                <Icon name="bell" className="h-5 w-5" />
                <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  3
                </span>
              </button>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-sky-600 to-blue-700 text-sm font-bold text-white">
                  {initials(displayName)}
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-slate-900">
                    {displayName}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {displayLabel}
                  </p>
                </div>

                <Icon name="chevronDown" className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Header: gradasi biru hanya di sisi kiri, gambar kanan bersih */}
            <header className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
              <div
                className="pointer-events-none absolute left-0 top-0 h-full w-[380px] bg-gradient-to-r from-blue-50 via-sky-50/80 to-transparent"
                style={{
                  maskImage:
                    "linear-gradient(to right, black 0%, black 55%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to right, black 0%, black 55%, transparent 100%)",
                }}
              />

              <div className="relative grid min-h-[180px] items-center gap-6 px-6 py-7 lg:grid-cols-[1fr_430px] lg:px-8">
                <div className="relative z-20">
                  <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-sky-600">
                    {roleLabel(storedUser?.role)}
                  </p>

                  <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                    {title || "Dashboard Administrasi"}
                  </h1>

                  {subtitle && (
                    <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-600 md:text-base">
                      {subtitle}
                    </p>
                  )}

                  {rightSlot && <div className="mt-5">{rightSlot}</div>}
                </div>

                <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 hidden w-[450px] overflow-visible lg:block">
                  <img
                    src="/images/bg-dashboard.png"
                    alt="Dashboard illustration"
                    className="absolute right-0 top-1/2 h-[205px] w-[450px] -translate-y-1/2 object-contain object-center drop-shadow-[0_12px_30px_rgba(14,165,233,0.12)]"
                  />
                </div>
              </div>
            </header>

            <div key={activeKey} className="animate-[contentIn_240ms_ease-out]">
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
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
      `}</style>
    </>
  );
}