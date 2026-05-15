"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { clearAuth, getStoredUser, redirectPathByRole, type AuthRole } from "../../lib/auth";
import { Icon } from "../ui/icons";

export type DashboardNavItem = {
  key: string;
  label: string;
  description?: string;
  href?: string;
  icon?: string;
  badge?: string;
  roles?: AuthRole[];
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
  if (role === "guru") return "Guru";
  if (role === "siswa") return "Siswa";
  return "Pengguna";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "SL";
}

function resolveIcon(name?: string) {
  const normalized = name?.toLowerCase().trim();
  if (!normalized) return "dashboard" as const;
  if (["◎", "profil", "profile", "user"].includes(normalized) || normalized.includes("profil")) return "profile" as const;
  if (["◇", "roadmap", "map"].includes(normalized) || normalized.includes("roadmap")) return "roadmap" as const;
  if (["▦", "hasil", "result", "chart"].includes(normalized) || normalized.includes("hasil")) return "result" as const;
  if (["◉", "bimbingan", "guidance"].includes(normalized) || normalized.includes("bimbing")) return "guidance" as const;
  if (normalized.includes("dashboard") || normalized.includes("home") || normalized === "d") return "dashboard" as const;
  if (normalized.includes("ver") || normalized.includes("check") || normalized === "v") return "verify" as const;
  if (normalized.includes("sekolah") || normalized.includes("school") || normalized.includes("building") || normalized === "s") return "school" as const;
  if (normalized.includes("lapor") || normalized.includes("report") || normalized === "l") return "report" as const;
  if (normalized.includes("ringkas") || normalized.includes("overview") || normalized === "r") return "overview" as const;
  if (normalized.includes("import") || normalized.includes("upload") || normalized === "i") return "upload" as const;
  if (normalized.includes("akun") || normalized.includes("users") || normalized === "a") return "users" as const;
  if (normalized.includes("akademik") || normalized.includes("graduation")) return "academic" as const;
  return "dashboard" as const;
}

function handleNavigation(item: DashboardNavItem, onNavigate?: (key: string) => void) {
  if (item.href?.startsWith("#")) {
    onNavigate?.(item.key);
    const target = document.querySelector(item.href);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  onNavigate?.(item.key);
}

function NavButton({
  item,
  active,
  compact = false,
  onClick,
}: {
  item: DashboardNavItem;
  active: boolean;
  compact?: boolean;
  onClick?: () => void;
}) {
  const iconName = resolveIcon(item.icon ?? item.label);
  const className = compact
    ? `group relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center transition duration-200 ${active ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`
    : `group relative flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition duration-200 ${active ? "border-blue-100 bg-white text-slate-950 shadow-sm" : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white/80 hover:text-slate-950"}`;

  const content = compact ? (
    <>
      <span className={`grid h-8 w-8 place-items-center rounded-xl transition ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-white"}`}>
        <Icon name={iconName} className="h-4 w-4" />
      </span>
      <span className="max-w-[74px] truncate text-[11px] font-medium leading-4">{item.label}</span>
    </>
  ) : (
    <>
      {active && <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-blue-500" />}
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition ${active ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-700"}`}>
        <Icon name={iconName} className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{item.label}</span>
        {item.description && <span className="mt-0.5 block truncate text-xs font-normal text-slate-400">{item.description}</span>}
      </span>
      {item.badge ? (
        <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700">{item.badge}</span>
      ) : (
        <Icon name="chevronRight" className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
      )}
    </>
  );

  if (item.href && !item.href.startsWith("#")) {
    return (
      <Link href={item.href} className={className} onClick={onClick} aria-current={active ? "page" : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick} aria-current={active ? "page" : undefined}>
      {content}
    </button>
  );
}

function LogoutModal({
  open,
  displayName,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  displayName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center px-4 py-6">
      <button className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onCancel} aria-label="Tutup modal logout" />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/20">
        <button type="button" onClick={onCancel} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-950" aria-label="Batal logout">
          <Icon name="x" className="h-4 w-4" />
        </button>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <Icon name="alert" className="h-5 w-5" />
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">Keluar dari SkillLens?</h2>
        <p className="mt-3 text-sm font-normal leading-7 text-slate-500">
          Sesi <span className="font-medium text-slate-800">{displayName}</span> akan diakhiri. Pastikan data penting sudah tersimpan sebelum logout.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            Batal
          </button>
          <button type="button" onClick={onConfirm} className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700">
            Ya, logout
          </button>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  activeKey,
  navItems,
  title,
  subtitle,
  userName,
  userLabel,
  schoolName,
  requiredRole,
  children,
  onNavigate,
  rightSlot,
}: DashboardShellProps) {
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [storedUser, setStoredUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    setStoredUser(user);

    const allowed = Array.isArray(requiredRole) ? requiredRole : requiredRole ? [requiredRole] : [];
    if (allowed.length && (!user || !allowed.includes(user.role))) {
      router.replace(redirectPathByRole(user?.role));
      return;
    }
    setReady(true);
  }, [requiredRole, router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const visibleNav = useMemo(() => {
    return navItems.filter((item) => !item.roles?.length || (storedUser?.role && item.roles.includes(storedUser.role)));
  }, [navItems, storedUser?.role]);

  const displayName = userName || storedUser?.nama || "Pengguna";
  const displayLabel = userLabel || roleLabel(storedUser?.role);
  const mobilePrimaryNav = visibleNav.slice(0, 4);

  function confirmLogout() {
    clearAuth();
    setLogoutOpen(false);
    router.replace("/auth/login");
  }

  const sidebar = (
    <aside className="flex h-full flex-col bg-white">
      <div className="px-5 pb-4 pt-5">
        <Link href={redirectPathByRole(storedUser?.role)} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-slate-50">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
            <Icon name="spark" className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight text-slate-950">SkillLens</p>
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">{roleLabel(storedUser?.role)} panel</p>
          </div>
        </Link>
      </div>

      <div className="px-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
              {initials(displayName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-950">{displayName}</p>
              <p className="truncate text-xs font-normal text-slate-500">{schoolName || displayLabel}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Menu</p>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">{visibleNav.length}</span>
        </div>
        <nav className="space-y-1.5">
          {visibleNav.map((item) => {
            const active = activeKey === item.key || (!!item.href && !item.href.startsWith("#") && pathname === item.href);
            return (
              <NavButton
                key={item.key}
                item={item}
                active={active}
                onClick={() => {
                  handleNavigation(item, onNavigate);
                  setOpen(false);
                }}
              />
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-5">
        <button onClick={() => setLogoutOpen(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 transition hover:border-rose-200 hover:bg-rose-100">
          <Icon name="logout" className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );

  if (!ready && requiredRole) {
    return <main className="grid min-h-screen place-items-center bg-slate-100 text-sm font-medium text-slate-500">Memeriksa akses...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] pb-24 text-slate-950 lg:pb-0">
      <header className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-slate-200 bg-white/85 backdrop-blur-xl lg:left-[280px]">
        <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-800 lg:hidden" aria-label="Buka menu">
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <div className="min-w-0 lg:hidden">
              <p className="truncate text-base font-semibold tracking-tight text-slate-950">SkillLens</p>
              <p className="truncate text-xs font-normal text-slate-500">{roleLabel(storedUser?.role)} Panel</p>
            </div>
            <div className="hidden min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-normal text-slate-500 md:flex">
              <Icon name="target" className="h-4 w-4 text-blue-600" />
              <span className="truncate">Workspace data sekolah, rekomendasi, dan tindak lanjut siswa.</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {rightSlot}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-[11px] font-semibold text-white">
                {initials(displayName)}
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-4 text-slate-950">{displayName}</p>
                <p className="text-xs font-normal text-slate-500">{displayLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="fixed inset-y-0 left-0 z-50 hidden w-[280px] overflow-hidden border-r border-slate-200 bg-white shadow-sm lg:block">{sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} aria-label="Tutup menu" />
          <div className="absolute bottom-0 left-0 top-0 w-[min(336px,90vw)] overflow-hidden rounded-r-3xl shadow-2xl shadow-slate-950/25">{sidebar}</div>
        </div>
      )}

      <section className="pt-[72px] lg:pl-[280px]">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-blue-700">
              <Icon name="spark" className="h-3.5 w-3.5" />
              SkillLens Workspace
            </div>
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-[34px]">{title}</h1>
                <p className="mt-3 max-w-3xl text-sm font-normal leading-7 text-slate-500 sm:text-[15px]">{subtitle}</p>
              </div>
            </div>
          </div>
          {children}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 shadow-[0_-10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-4 gap-2">
          {mobilePrimaryNav.map((item) => {
            const active = activeKey === item.key || (!!item.href && !item.href.startsWith("#") && pathname === item.href);
            return (
              <NavButton
                key={item.key}
                item={item}
                compact
                active={active}
                onClick={() => handleNavigation(item, onNavigate)}
              />
            );
          })}
        </div>
      </div>

      <LogoutModal open={logoutOpen} displayName={displayName} onCancel={() => setLogoutOpen(false)} onConfirm={confirmLogout} />
    </main>
  );
}
