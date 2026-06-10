
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type React from "react";
import { createPortal } from "react-dom";
import {
  clearAuth,
  getStoredUser,
  persistAuth,
  redirectPathByRole,
  type AuthRole,
} from "../../lib/auth";
import { Icon } from "../ui/icons";
import { getSchoolVerifications, type VerificationRow } from "../../features/admin/api";
import { apiFetch } from "../../lib/axios";

export type DashboardNavItem = {
  key: string;
  label: string;
  description?: string;
  href?: string;
  icon?: string;
  badge?: string;
  roles?: readonly AuthRole[];
};

type PendingAdminSekolahRow = {
  id?: number;
  id_user?: number;
  nama?: string;
  name?: string;
  username?: string;
  email?: string;
  school?: string;
  nama_sekolah?: string;
  status?: string;
};

function normalizeApiList<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];

  if (result && typeof result === "object") {
    const data = (result as { data?: unknown; rows?: unknown; items?: unknown }).data;

    if (Array.isArray(data)) return data as T[];

    const rows = (result as { rows?: unknown }).rows;
    if (Array.isArray(rows)) return rows as T[];

    const items = (result as { items?: unknown }).items;
    if (Array.isArray(items)) return items as T[];
  }

  return [];
}

function getPendingAdminSekolahName(item: PendingAdminSekolahRow) {
  return (
    item.nama ||
    item.name ||
    item.username ||
    item.email ||
    item.school ||
    item.nama_sekolah ||
    "Admin sekolah baru"
  );
}

function isSuperadminAdminNavKey(key: string) {
  return ["kelola-admin", "admin", "admins", "admin-sekolah"].includes(key);
}

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

function normalizeDashboardPath(value?: string | null) {
  const path = String(value || "").split("#")[0].split("?")[0] || "/";
  if (path.length > 1) return path.replace(/\/+$/, "");
  return path;
}

function navIsActive(
  item: DashboardNavItem,
  activeKey: string,
  pathname: string,
) {
  if (item.key === activeKey) return true;
  if (item.href && !item.href.includes("#")) {
    return normalizeDashboardPath(item.href) === normalizeDashboardPath(pathname);
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
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/45 p-4 text-slate-950 backdrop-blur-[2px] sm:p-6">
      <button
        type="button"
        aria-label="Batal logout"
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
      />

      <section
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)] animate-[modalIn_220ms_ease-out]"
      >
        <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-white via-slate-50 to-rose-50/55 px-6 py-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-rose-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-36 w-36 rounded-full bg-slate-100/90 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-rose-600">
                  Konfirmasi Logout
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Keluar dari SkillLens?
                </h2>

                <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
                  Sesi akan diakhiri dan kamu perlu login kembali untuk mengakses dashboard.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Batal logout"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white px-6 py-4 shadow-[0_-12px_30px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition hover:-translate-y-0.5 hover:bg-rose-700"
            >
              Ya, logout
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}


function PasswordChangeReminderModal({
  open,
  onLater,
  onChanged,
}: {
  open: boolean;
  onLater: () => void;
  onChanged: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const checks = [
    { label: "Minimal 8 karakter", valid: newPassword.length >= 8 },
    { label: "Huruf besar dan kecil", valid: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) },
    { label: "Ada angka", valid: /[0-9]/.test(newPassword) },
    { label: "Ada simbol", valid: /[^A-Za-z0-9]/.test(newPassword) },
    { label: "Konfirmasi sesuai", valid: !!confirmPassword && newPassword === confirmPassword },
  ];
  const passwordReady = checks.every((item) => item.valid);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!currentPassword) {
      setError("Isi password lama/default terlebih dahulu.");
      return;
    }

    if (!passwordReady) {
      setError("Password baru belum memenuhi syarat.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiFetch<{
        message?: string;
        token?: string;
        user?: {
          id?: number;
          id_user?: number;
          nama: string;
          email?: string;
          username: string;
          role: AuthRole;
          id_sekolah?: number | null;
          must_change_password?: boolean;
        };
      }>("/auth/change-default-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
        alert: false,
        successMessage: false,
        errorMessage: false,
      });

      const stored = getStoredUser();
      const token = result.token || localStorage.getItem("skilllens_token") || "";
      const nextUser = result.user;

      if (token && (nextUser || stored)) {
        persistAuth(
          token,
          nextUser
            ? {
                id: nextUser.id || nextUser.id_user || stored?.id || 0,
                nama: nextUser.nama,
                email: nextUser.email,
                username: nextUser.username,
                role: nextUser.role,
                id_sekolah: nextUser.id_sekolah ?? stored?.id_sekolah ?? null,
                must_change_password: false,
              }
            : { ...stored!, must_change_password: false },
          localStorage.getItem("skilllens_remember") === "true",
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengganti password.");
    } finally {
      setLoading(false);
    }
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/38 p-4 text-slate-950 backdrop-blur-[3px] sm:p-6">
      <button
        type="button"
        aria-label="Tutup modal"
        onClick={onLater}
        className="absolute inset-0 cursor-default"
      />

      <section
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.8rem] border border-sky-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.22)] animate-[modalIn_220ms_ease-out]"
      >
        <div className="relative shrink-0 overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-6 py-6 text-slate-950">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.045)_1px,transparent_1px)] bg-[size:34px_34px]" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-sky-200/20 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-white text-sky-700 shadow-sm shadow-sky-100/70">
                <Icon name="shield" className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700">
                  Keamanan Akun
                </p>

                <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950">
                  Ganti password awal
                </h2>

                <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-600">
                  Akun masih memakai password bawaan. Ubah password agar dashboard
                  bisa dipakai dengan lebih aman.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLater}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Tutup"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-br from-white via-slate-50/40 to-sky-50/30 px-6 py-6"
        >
          {error ? (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 shadow-sm">
              {error}
            </div>
          ) : null}

          <div className="rounded-[1.4rem] border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100/50">
            <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                <Icon name="shield" className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-black text-slate-950">
                  Form Password Baru
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  Masukkan password lama/default, lalu buat password baru yang
                  lebih kuat.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Password lama/default
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Masukkan password lama/default"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Password baru
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Masukkan password baru"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Konfirmasi password
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-black text-sky-700 transition hover:bg-sky-100 hover:text-sky-900"
              >
                {showPassword ? "Sembunyikan password" : "Tampilkan password"}
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <Icon name="check" className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-black text-slate-950">
                  Syarat password
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  Pastikan semua syarat terpenuhi sebelum menyimpan password baru.
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {checks.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold transition ${
                    item.valid
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      : "bg-slate-50 text-slate-500 ring-1 ring-slate-100"
                  }`}
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                      item.valid
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-white text-slate-400"
                    }`}
                  >
                    <Icon name={item.valid ? "check" : "x"} className="h-3 w-3" />
                  </span>

                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onLater}
              disabled={loading}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Nanti dulu
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Icon name="shield" className="h-4 w-4" />
              {loading ? "Menyimpan..." : "Simpan password"}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}

function NavItem({
  item,
  active,
  onClick,
}: {
  item: DashboardNavItem;
  active: boolean;
  onClick: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
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
        prefetch={false}
        onClick={(event) => onClick(event)}
        id={`dashboard-nav-${item.key}`}
        aria-current={active ? "page" : undefined}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => onClick(event)}
      aria-current={active ? "page" : undefined}
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
  const [passwordReminderOpen, setPasswordReminderOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [storedUser, setStoredUser] =
    useState<ReturnType<typeof getStoredUser>>(null);
  const [pendingVerifications, setPendingVerifications] = useState<VerificationRow[]>([]);
  const [pendingAdminSekolah, setPendingAdminSekolah] = useState<PendingAdminSekolahRow[]>([]);

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
    if (!ready) return;

    const needsPasswordChange =
      storedUser?.role === "guru" &&
      Boolean(storedUser?.must_change_password) &&
      pathname !== "/guru/profil";

    if (needsPasswordChange) {
      const timeout = window.setTimeout(() => setPasswordReminderOpen(true), 280);
      return () => window.clearTimeout(timeout);
    }

    setPasswordReminderOpen(false);
  }, [pathname, ready, storedUser?.must_change_password, storedUser?.role]);

  useEffect(() => {
    let alive = true;

    async function loadHeaderNotifications() {
      setPendingVerifications([]);
      setPendingAdminSekolah([]);

      if (storedUser?.role === "admin") {
        try {
          const rows = await getSchoolVerifications();

          if (!alive) return;

          setPendingVerifications(
            rows.filter((item) => item.status === "pending"),
          );
        } catch {
          if (alive) setPendingVerifications([]);
        }

        return;
      }

      if (storedUser?.role === "superadmin") {
        const endpointCandidates = [
          "/superadmin/admin-sekolah?status=pending",
          "/superadmin/admin-sekolah/pending",
          "/superadmin/admins?role=admin_sekolah&status=pending",
        ];

        for (const endpoint of endpointCandidates) {
          try {
            const result = await apiFetch<unknown>(endpoint, {
              method: "GET",
              alert: false,
              successMessage: false,
              errorMessage: false,
            });

            if (!alive) return;

            const rows = normalizeApiList<PendingAdminSekolahRow>(result);
            const pendingRows = rows.filter(
              (item) => !item.status || item.status === "pending",
            );

            setPendingAdminSekolah(pendingRows);
            return;
          } catch {
          }
        }

        if (alive) setPendingAdminSekolah([]);
      }
    }

    loadHeaderNotifications();

    return () => {
      alive = false;
    };
  }, [storedUser?.role, pathname]);

  useEffect(() => {
    setOpen(false);

    const timeout = window.setTimeout(() => {
      setRouteSwitching(false);
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [pathname, activeKey]);

  const pendingVerificationCount =
    storedUser?.role === "admin" ? pendingVerifications.length : 0;

  const pendingAdminSekolahCount =
    storedUser?.role === "superadmin" ? pendingAdminSekolah.length : 0;

  const visibleNav = useMemo(
    () =>
      navItems
        .filter(
          (item) =>
            !item.roles?.length ||
            (storedUser?.role && item.roles.includes(storedUser.role)),
        )
        .map((item) => {
          if (
            storedUser?.role === "admin" &&
            item.key === "verifikasi" &&
            pendingVerificationCount > 0
          ) {
            return { ...item, badge: String(pendingVerificationCount) };
          }

          if (
            storedUser?.role === "superadmin" &&
            isSuperadminAdminNavKey(item.key) &&
            pendingAdminSekolahCount > 0
          ) {
            return { ...item, badge: String(pendingAdminSekolahCount) };
          }

          return item;
        }),
    [
      navItems,
      pendingAdminSekolahCount,
      pendingVerificationCount,
      storedUser?.role,
    ],
  );

  const latestPendingSchools = pendingVerifications.slice(0, 2);
  const notificationCount =
    storedUser?.role === "admin"
      ? pendingVerificationCount
      : storedUser?.role === "superadmin"
        ? pendingAdminSekolahCount
        : 0;

  const notificationTitle =
    storedUser?.role === "admin"
      ? "Verifikasi sekolah"
      : storedUser?.role === "superadmin"
        ? "Admin sekolah baru"
        : "Notifikasi";

  const notificationDescription =
    storedUser?.role === "admin"
      ? "Pengajuan sekolah baru menunggu verifikasi."
      : storedUser?.role === "superadmin"
        ? "Pengajuan admin sekolah baru masuk ke sistem."
        : "Belum ada notifikasi baru.";

  const notificationHref =
    storedUser?.role === "admin" ? "/admin/verifikasi" : "/superadmin/kelola-admin";
  const latestPendingAdminSekolah = pendingAdminSekolah.slice(0, 2);

  const displayName = userName || storedUser?.nama || "Pengguna";
  const displayLabel = userLabel || roleLabel(storedUser?.role);

  function logout() {
    clearAuth();
    setLogoutOpen(false);
    router.replace("/auth/login");
  }

  function navigate(
    item: DashboardNavItem,
    event?: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) {
    const currentPath = normalizeDashboardPath(pathname);
    const targetPath = normalizeDashboardPath(item.href);
    const hasRealRoute = Boolean(item.href && !item.href.includes("#"));
    const isSameRoute = hasRealRoute && targetPath === currentPath;
    const isSameTab = !item.href && item.key === activeKey;

    if (isSameRoute || isSameTab) {
      event?.preventDefault();
      setOpen(false);
      setRouteSwitching(false);
      return;
    }

    if (item.href?.includes("#")) {
      const hash = item.href.split("#")[1];
      const hashBasePath = normalizeDashboardPath(item.href.split("#")[0] || pathname);

      if (hashBasePath === currentPath) {
        event?.preventDefault();
      }

      setOpen(false);
      onNavigate?.(item.key);

      window.setTimeout(() => {
        document
          .getElementById(hash)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 30);

      return;
    }

    setRouteSwitching(true);
    setOpen(false);
    onNavigate?.(item.key);
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
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3 rounded-2xl p-2">
          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-sky-100">
            <img
              src="/images/logo-skillens.png"
              alt="SkillLens Logo"
              className="h-10 w-10 object-contain"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-black tracking-tight text-slate-800">
              SkillLens
            </p>

            <p className="max-w-[170px] whitespace-normal break-words text-[10px] font-black uppercase leading-4 tracking-[0.14em] text-sky-600">
              {roleLabel(storedUser?.role)} panel
            </p>
          </div>
        </div>
      </div>

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

      <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-4 pb-4">
        {visibleNav.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            active={navIsActive(item, activeKey, pathname)}
            onClick={(event) => navigate(item, event)}
          />
        ))}
      </nav>

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
      <main className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/40 text-slate-950 lg:grid lg:grid-cols-[276px_1fr]">
        <div className="pointer-events-none fixed inset-0 bg-[repeating-linear-gradient(45deg,_rgba(14,116,144,0.018)_0px,_rgba(14,116,144,0.018)_1px,_transparent_1px,_transparent_24px)]" />

        {routeSwitching && (
          <>
            <div className="fixed left-0 right-0 top-0 z-[100] h-1 overflow-hidden bg-sky-100">
              <div className="h-full w-1/2 animate-[routeProgress_720ms_ease-in-out_infinite] rounded-r-full bg-gradient-to-r from-sky-500 to-cyan-400" />
            </div>
            <div className="pointer-events-none fixed right-5 top-5 z-[101] hidden rounded-2xl border border-sky-100 bg-white/92 px-4 py-2 text-xs font-black text-sky-700 shadow-lg shadow-sky-100/70 backdrop-blur md:inline-flex">
              Memuat halaman...
            </div>
          </>
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
          <div className="mx-auto w-full max-w-[1760px] px-5 py-5 lg:px-8">
            <div className="relative mb-4 flex justify-end">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationOpen((value) => !value)}
                  className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-white text-sky-700 shadow-sm shadow-sky-100/60 transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md"
                  aria-label="Buka notifikasi"
                >
                  <Icon name="clipboard" className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 top-14 z-50 w-[min(92vw,390px)] overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-2xl shadow-slate-950/15">
                    <div className="border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/50 to-sky-50/70 px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Notifikasi</p>
                          <h3 className="mt-1 text-base font-black text-slate-950">{notificationTitle}</h3>
                        </div>
                        <button type="button" onClick={() => setNotificationOpen(false)} className="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-800" aria-label="Tutup notifikasi">
                          <Icon name="x" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      {notificationCount > 0 ? (
                        <div className="space-y-3">
                          <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                            <p className="text-sm font-black text-slate-900">Ada {notificationCount} notifikasi baru</p>
                            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{notificationDescription}</p>
                          </div>

                          <div className="space-y-2">
                            {storedUser?.role === "admin" && latestPendingSchools.map((item) => (
                              <div key={`${item.id}-${item.school}`} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                                <p className="text-sm font-bold text-slate-800">{item.school}</p>
                                <p className="mt-0.5 text-xs font-medium text-slate-500">Menunggu verifikasi sekolah</p>
                              </div>
                            ))}
                            {storedUser?.role === "superadmin" && latestPendingAdminSekolah.map((item) => (
                              <div key={`${item.id || item.id_user || getPendingAdminSekolahName(item)}-${getPendingAdminSekolahName(item)}`} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                                <p className="text-sm font-bold text-slate-800">{getPendingAdminSekolahName(item)}</p>
                                <p className="mt-0.5 text-xs font-medium text-slate-500">Pengajuan admin sekolah baru</p>
                              </div>
                            ))}
                          </div>

                          <Link href={notificationHref} onClick={() => setNotificationOpen(false)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-4 py-3 text-sm font-black text-white shadow-md shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-lg">
                            Buka notifikasi
                            <Icon name="chevronRight" className="h-4 w-4" />
                          </Link>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center">
                          <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm">
                            <Icon name="clipboard" className="h-5 w-5" />
                          </div>
                          <p className="mt-3 text-sm font-black text-slate-800">Tidak ada notifikasi</p>
                          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Semua data sudah aman untuk saat ini.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                "transition-all duration-500 ease-out",
                routeSwitching
                  ? "translate-y-2 opacity-0 blur-[1px]"
                  : "translate-y-0 opacity-100 blur-0 animate-[contentIn_380ms_ease-out]",
              ].join(" ")}
            >
              {children}
            </div>
          </div>
        </section>
      </main>

      <PasswordChangeReminderModal
        open={passwordReminderOpen}
        onLater={() => setPasswordReminderOpen(false)}
        onChanged={() => {
          setPasswordReminderOpen(false);
          setStoredUser(getStoredUser());
        }}
      />

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