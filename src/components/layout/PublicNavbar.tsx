"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "../ui/icons";
import { LogoutConfirmModal } from "../ui/LogoutConfirmModal";

type StoredUser = {
  id?: number;
  nama?: string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  id_sekolah?: number | null;
};

type AuthState = {
  token: string;
  user: StoredUser;
};

const navItems = [
  { label: "Tentang", href: "/#tentang", hash: "tentang" },
  { label: "Fitur", href: "/#fitur", hash: "fitur" },
  { label: "Kelebihan", href: "/#kelebihan", hash: "kelebihan" },
  { label: "Peran", href: "/#peran", hash: "peran" },
  { label: "Keamanan", href: "/#keamanan", hash: "keamanan" },
  { label: "Alur", href: "/#alur", hash: "alur" },
  { label: "Metode", href: "/#metode", hash: "metode" },
];

const roleLabels: Record<string, string> = {
  superadmin: "Superadmin",
  admin_sekolah: "Admin Sekolah",
  guru: "Guru",
  siswa: "Siswa",
};

const dashboardPathByRole: Record<string, string> = {
  superadmin: "/superadmin",
  admin_sekolah: "/admin-sekolah",
  guru: "/guru",
  siswa: "/siswa",
};

function navTextClass(isActive: boolean) {
  return [
    "relative py-2 transition duration-300",
    "after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:-translate-x-1/2 after:rounded-full",
    "after:bg-gradient-to-r after:from-cyan-300 after:to-sky-400 after:transition-all after:duration-300",
    isActive
      ? "text-cyan-200 after:w-full"
      : "text-white/75 hover:text-cyan-200 after:w-0 hover:after:w-full",
  ].join(" ");
}

function readStorageValue(keys: string[]) {
  for (const key of keys) {
    const localValue =
      typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    const sessionValue =
      typeof window !== "undefined" ? window.sessionStorage.getItem(key) : null;

    if (localValue) return localValue;
    if (sessionValue) return sessionValue;
  }

  return null;
}

function getStoredAuth(): AuthState | null {
  if (typeof window === "undefined") return null;

  const token = readStorageValue([
    "token",
    "access_token",
    "skilllens_token",
    "skilllens_access_token",
  ]);

  const rawUser = readStorageValue(["user", "skilllens_user"]);

  if (!token || !rawUser) return null;

  try {
    const user = JSON.parse(rawUser) as StoredUser;
    return { token, user };
  } catch {
    return null;
  }
}

function clearStoredAuth() {
  const keys = [
    "token",
    "access_token",
    "user",
    "skilllens_token",
    "skilllens_access_token",
    "skilllens_user",
  ];

  keys.forEach((key) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  });

  window.dispatchEvent(new Event("skilllens-auth-changed"));
}

export function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [activeSection, setActiveSection] = useState("");
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const userDisplayName = useMemo(() => {
    return (
      auth?.user?.nama ||
      auth?.user?.name ||
      auth?.user?.username ||
      auth?.user?.email ||
      "Pengguna"
    );
  }, [auth]);

  const roleLabel = useMemo(() => {
    const role = auth?.user?.role || "";
    return roleLabels[role] || role || "Akun";
  }, [auth]);

  const dashboardHref = useMemo(() => {
    const role = auth?.user?.role || "";
    return dashboardPathByRole[role] || "/";
  }, [auth]);

  useEffect(() => {
    const syncAuth = () => {
      setAuth(getStoredAuth());
    };

    syncAuth();

    window.addEventListener("storage", syncAuth);
    window.addEventListener("skilllens-auth-changed", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("skilllens-auth-changed", syncAuth);
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const sectionIds = navItems.map((item) => item.hash);

    const updateActiveSection = () => {
      let current = "";

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        const rect = element.getBoundingClientRect();

        if (rect.top <= 120 && rect.bottom >= 120) {
          current = id;
          break;
        }
      }

      if (!current && window.scrollY < 120) {
        current = "";
      }

      setActiveSection(current);
    };

    updateActiveSection();

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("hashchange", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("hashchange", updateActiveSection);
    };
  }, [pathname]);

  function handleLogout() {
    clearStoredAuth();
    setAuth(null);
    setLogoutOpen(false);
    router.push("/auth/login");
  }

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-[999] border-b border-white/10 bg-[#0a0f2a]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-[min(1220px,calc(100%-32px))] items-center justify-between gap-4 py-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-950 shadow-lg transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-cyan-300/30">
              <Icon name="spark" className="h-5 w-5" />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-white transition group-hover:text-cyan-200">
                SkillLens
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-100/80">
                Career Decision Support
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-sm font-medium lg:flex">
            {navItems.map((item) => {
              const isActive = pathname === "/" && activeSection === item.hash;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navTextClass(isActive)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {!auth ? (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className={`hidden rounded-full border px-5 py-2.5 text-sm font-medium backdrop-blur-sm transition duration-300 sm:inline-block ${
                  pathname === "/auth/login"
                    ? "border-cyan-300/60 bg-white text-slate-950"
                    : "border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950"
                }`}
              >
                Masuk
              </Link>

              <Link
                href="/auth/register"
                className={`rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition duration-300 hover:-translate-y-0.5 ${
                  pathname === "/auth/register"
                    ? "bg-white text-slate-950 shadow-cyan-400/30 ring-2 ring-cyan-300/50"
                    : "bg-gradient-to-r from-cyan-300 to-sky-400 text-slate-950 hover:shadow-cyan-400/30"
                }`}
              >
                Daftar Admin Sekolah
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href={dashboardHref}
                className="hidden rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-left backdrop-blur-sm transition hover:bg-white/15 sm:block"
              >
                <p className="max-w-[150px] truncate text-sm font-semibold text-white">
                  {userDisplayName}
                </p>
                <p className="mt-0.5 text-xs font-medium text-cyan-100/80">
                  {roleLabel}
                </p>
              </Link>

              <button
                type="button"
                onClick={() => setLogoutOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-950"
              >
                <Icon name="logout" className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <LogoutConfirmModal
        open={logoutOpen}
        username={userDisplayName}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}