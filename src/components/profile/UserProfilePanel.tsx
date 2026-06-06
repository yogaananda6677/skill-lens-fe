"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";

import { notifyAppAlert } from "../../lib/app-alert-events";
import { apiFetch } from "../../lib/axios";
import { persistAuth, type AuthRole } from "../../lib/auth";
import {
  type AvailabilityResponse,
  type AvailabilityStatus,
  availabilityMessage,
  cleanPhoneInput,
  getAvailabilityValue,
  getPasswordChecks,
  getPasswordStrength,
  normalizePhone,
  validateEmail,
  validateName,
  validatePhone,
  validateUsername,
} from "../../lib/form-rules";
import { Icon } from "../ui/icons";
import { FormSkeleton } from "../ui/LoadingSkeleton";

type ProfileUser = {
  id?: number;
  id_user?: number;
  nama: string;
  email: string;
  username: string;
  no_hp?: string | null;
  role?: AuthRole;
  id_sekolah?: number | null;
  must_change_password?: boolean;
};

type UserProfilePanelProps = {
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
};

type ProfileForm = {
  nama: string;
  email: string;
  username: string;
  no_hp: string;
};

type PasswordForm = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

const emptyProfile: ProfileForm = {
  nama: "",
  email: "",
  username: "",
  no_hp: "",
};

const emptyPassword: PasswordForm = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

const shellCardClass =
  "overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60";

const sectionHeaderClass =
  "border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-5";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50";

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-sky-200 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50";


function FieldMessage({ error, success, loading }: { error?: string; success?: string; loading?: string }) {
  if (loading) return <p className="mt-2 text-xs font-bold text-sky-600">{loading}</p>;
  if (error) return <p className="mt-2 text-xs font-bold text-rose-600">{error}</p>;
  if (success) return <p className="mt-2 text-xs font-bold text-emerald-600">{success}</p>;
  return null;
}

function roleLabel(role?: string) {
  if (role === "admin") return "Admin Platform";
  if (role === "superadmin") return "Superadmin";
  if (role === "admin_sekolah") return "Admin Sekolah";
  if (role === "guru") return "Guru BK";
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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm shadow-sky-100/40">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  visible,
  onToggle,
  onChange,
}: {
  label: string;
  value: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-sky-50 hover:text-sky-700"
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        >
          <Icon name={visible ? "eyeOff" : "eye"} className="h-4 w-4" />
        </button>
      </div>
    </label>
  );
}

export function UserProfilePanel({
  title = "Profil Saya",
  subtitle = "Kelola data diri dan keamanan akun.",
  showHeader = true,
}: UserProfilePanelProps) {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfile);
  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>(emptyPassword);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState<AvailabilityStatus>("idle");
  const [usernameStatus, setUsernameStatus] = useState<AvailabilityStatus>("idle");
  const [touched, setTouched] = useState<Record<keyof ProfileForm, boolean>>({
    nama: false,
    email: false,
    username: false,
    no_hp: false,
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function loadProfile() {
    setLoading(true);

    try {
      const result = await apiFetch<{ data: ProfileUser }>("/auth/me", {
        method: "GET",
      });

      const nextUser = result.data;

      setUser(nextUser);
      setProfileForm({
        nama: nextUser.nama || "",
        email: nextUser.email || "",
        username: nextUser.username || "",
        no_hp: nextUser.no_hp || "",
      });
    } catch (err) {
      notifyAppAlert({
        type: "error",
        title: "Profil gagal dimuat",
        description:
          err instanceof Error ? err.message : "Profil gagal dimuat.",
        autoCloseMs: false,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function updateProfile(key: keyof ProfileForm, value: string) {
    let nextValue = value;
    if (key === "email" || key === "username") nextValue = value.trim().toLowerCase();
    if (key === "no_hp") nextValue = cleanPhoneInput(value);

    setTouched((current) => ({ ...current, [key]: true }));
    setProfileForm((current) => ({ ...current, [key]: nextValue }));
  }

  function updatePassword(key: keyof PasswordForm, value: string) {
    setPasswordForm((current) => ({ ...current, [key]: value }));
  }

  const profileErrors = useMemo(() => ({
    nama: validateName(profileForm.nama),
    email: validateEmail(profileForm.email),
    username: validateUsername(profileForm.username),
    no_hp: validatePhone(profileForm.no_hp),
  }), [profileForm.email, profileForm.nama, profileForm.no_hp, profileForm.username]);

  const passwordChecks = useMemo(
    () => getPasswordChecks(passwordForm.new_password, {
      username: profileForm.username,
      email: profileForm.email,
      name: profileForm.nama,
    }),
    [passwordForm.new_password, profileForm.email, profileForm.nama, profileForm.username],
  );
  const passwordScore = passwordChecks.filter((item) => item.valid).length;
  const passwordStrength = getPasswordStrength(passwordScore, passwordChecks.length);
  const passwordReady = passwordChecks.every((item) => item.valid);

  useEffect(() => {
    const emailClean = profileForm.email.trim().toLowerCase();
    const currentEmail = user?.email?.trim().toLowerCase() || "";

    if (!emailClean || profileErrors.email || emailClean === currentEmail) {
      setEmailStatus("idle");
      return;
    }

    let alive = true;
    const timeout = window.setTimeout(async () => {
      setEmailStatus("checking");
      try {
        const result = await apiFetch<AvailabilityResponse>(`/auth/check-availability?email=${encodeURIComponent(emailClean)}`, {
          method: "GET",
          alert: false,
        });
        if (!alive) return;
        setEmailStatus(getAvailabilityValue(result, "email") ? "available" : "unavailable");
      } catch {
        if (alive) setEmailStatus("error");
      }
    }, 450);

    return () => {
      alive = false;
      window.clearTimeout(timeout);
    };
  }, [profileForm.email, profileErrors.email, user?.email]);

  useEffect(() => {
    const usernameClean = profileForm.username.trim().toLowerCase();
    const currentUsername = user?.username?.trim().toLowerCase() || "";

    if (!usernameClean || profileErrors.username || usernameClean === currentUsername) {
      setUsernameStatus("idle");
      return;
    }

    let alive = true;
    const timeout = window.setTimeout(async () => {
      setUsernameStatus("checking");
      try {
        const result = await apiFetch<AvailabilityResponse>(`/auth/check-availability?username=${encodeURIComponent(usernameClean)}`, {
          method: "GET",
          alert: false,
        });
        if (!alive) return;
        setUsernameStatus(getAvailabilityValue(result, "username") ? "available" : "unavailable");
      } catch {
        if (alive) setUsernameStatus("error");
      }
    }, 450);

    return () => {
      alive = false;
      window.clearTimeout(timeout);
    };
  }, [profileForm.username, profileErrors.username, user?.username]);

  function emailMessage() {
    if (touched.email && profileErrors.email) return { error: profileErrors.email };
    return availabilityMessage(emailStatus, "email");
  }

  function usernameMessage() {
    if (touched.username && profileErrors.username) return { error: profileErrors.username };
    return availabilityMessage(usernameStatus, "username");
  }

  async function submitProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTouched({ nama: true, email: true, username: true, no_hp: true });

    const firstError = Object.values(profileErrors).find(Boolean);
    if (firstError) {
      notifyAppAlert({ type: "error", title: "Periksa kembali data profil", description: String(firstError), autoCloseMs: 2600 });
      return;
    }

    if (emailStatus === "checking" || usernameStatus === "checking") {
      notifyAppAlert({ type: "error", title: "Tunggu pengecekan selesai", autoCloseMs: 2400 });
      return;
    }

    if (emailStatus === "unavailable" || usernameStatus === "unavailable") {
      notifyAppAlert({ type: "error", title: "Email atau username sudah digunakan", autoCloseMs: 2600 });
      return;
    }

    setSavingProfile(true);

    try {
      const result = await apiFetch<{
        message?: string;
        token?: string;
        data?: ProfileUser;
        user?: ProfileUser;
      }>("/auth/me", {
        method: "PUT",
        body: JSON.stringify({
          nama: profileForm.nama.trim(),
          email: profileForm.email.trim().toLowerCase(),
          username: profileForm.username.trim().toLowerCase(),
          no_hp: normalizePhone(profileForm.no_hp.trim()),
        }),
        successMessage: false,
        errorMessage: false,
      });

      const nextUser = result.data || result.user;

      if (nextUser) {
        setUser(nextUser);
        setProfileForm({
          nama: nextUser.nama || "",
          email: nextUser.email || "",
          username: nextUser.username || "",
          no_hp: nextUser.no_hp || "",
        });

        if (result.token && nextUser.role) {
          persistAuth(
            result.token,
            {
              id: nextUser.id || nextUser.id_user || 0,
              nama: nextUser.nama,
              email: nextUser.email,
              username: nextUser.username,
              role: nextUser.role,
              id_sekolah: nextUser.id_sekolah ?? null,
              must_change_password: nextUser.must_change_password,
            },
            localStorage.getItem("skilllens_remember") === "true",
          );
        }
      }

      notifyAppAlert({
        type: "success",
        title: "Profil berhasil diperbarui",
        description: result.message || "Data profil berhasil disimpan.",
        autoCloseMs: 2200,
      });
    } catch (err) {
      notifyAppAlert({
        type: "error",
        title: "Profil gagal diperbarui",
        description:
          err instanceof Error ? err.message : "Profil gagal diperbarui.",
        autoCloseMs: false,
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passwordForm.current_password) {
      notifyAppAlert({
        type: "error",
        title: "Password lama wajib diisi",
        autoCloseMs: 2400,
      });
      return;
    }

    if (!passwordReady) {
      notifyAppAlert({
        type: "error",
        title: "Password baru belum memenuhi syarat",
        description: "Lengkapi semua indikator keamanan password.",
        autoCloseMs: 2600,
      });
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      notifyAppAlert({
        type: "error",
        title: "Konfirmasi password tidak sesuai",
        autoCloseMs: 2400,
      });
      return;
    }

    setSavingPassword(true);

    try {
      const result = await apiFetch<{ message?: string; token?: string; user?: ProfileUser }>(
        "/auth/change-default-password",
        {
          method: "POST",
          body: JSON.stringify(passwordForm),
          successMessage: false,
          errorMessage: false,
        },
      );

      setPasswordForm(emptyPassword);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      if (result.token && result.user?.role) {
        persistAuth(
          result.token,
          {
            id: result.user.id || result.user.id_user || user?.id || user?.id_user || 0,
            nama: result.user.nama || user?.nama || "Pengguna",
            email: result.user.email || user?.email,
            username: result.user.username || user?.username || "",
            role: result.user.role,
            id_sekolah: result.user.id_sekolah ?? user?.id_sekolah ?? null,
            must_change_password: false,
          },
          localStorage.getItem("skilllens_remember") === "true",
        );
        setUser((current) => current ? { ...current, must_change_password: false } : current);
      }

      notifyAppAlert({
        type: "success",
        title: "Password berhasil diperbarui",
        description: result.message || "Password berhasil diperbarui.",
        autoCloseMs: 2600,
      });
    } catch (err) {
      notifyAppAlert({
        type: "error",
        title: "Password gagal diperbarui",
        description:
          err instanceof Error ? err.message : "Password gagal diperbarui.",
        autoCloseMs: false,
      });
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <FormSkeleton />;
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <aside className={shellCardClass}>
          <div className={sectionHeaderClass}>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
              Kartu Profil
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
              Informasi Akun
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Ringkasan identitas pengguna yang sedang aktif.
            </p>
          </div>

          <div className="bg-gradient-to-b from-white via-sky-50/40 to-white p-5">
            <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100/50">
              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 text-2xl font-black text-white shadow-lg shadow-sky-600/20">
                {initials(user?.nama || "User")}
              </div>

              <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
                {user?.nama || "Pengguna"}
              </h2>

              <p className="mt-1 inline-flex rounded-full bg-gradient-to-r from-white via-cyan-50/80 to-sky-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-700 ring-1 ring-sky-100">
                {roleLabel(user?.role)}
              </p>

              <div className="mt-6 space-y-3 text-sm">
                <InfoItem label="Email" value={user?.email || "-"} />
                <InfoItem label="Username" value={`@${user?.username || "-"}`} />
                <InfoItem label="Nomor HP" value={user?.no_hp || "Belum diisi"} />
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <form onSubmit={submitProfile} className={shellCardClass}>
            <div className={sectionHeaderClass}>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                  <Icon name="profile" className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
                    Data Diri
                  </p>
                  <h3 className="text-xl font-black tracking-tight text-slate-900">
                    Ubah Profil
                  </h3>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Nama lengkap
                  </span>
                  <input
                    value={profileForm.nama}
                    onChange={(event) => updateProfile("nama", event.target.value)}
                    onBlur={() => setTouched((current) => ({ ...current, nama: true }))}
                    minLength={3}
                    maxLength={80}
                    className={inputClass}
                  />
                  <FieldMessage error={touched.nama ? profileErrors.nama : ""} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Username
                  </span>
                  <input
                    value={profileForm.username}
                    onChange={(event) => updateProfile("username", event.target.value)}
                    onBlur={() => setTouched((current) => ({ ...current, username: true }))}
                    minLength={5}
                    maxLength={24}
                    className={inputClass}
                  />
                  <FieldMessage {...usernameMessage()} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Email
                  </span>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => updateProfile("email", event.target.value)}
                    onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                    autoComplete="email"
                    maxLength={120}
                    className={inputClass}
                  />
                  <FieldMessage {...emailMessage()} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Nomor HP
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={profileForm.no_hp}
                    onChange={(event) => updateProfile("no_hp", event.target.value)}
                    onBlur={() => setTouched((current) => ({ ...current, no_hp: true }))}
                    placeholder="Contoh: 081234567890"
                    className={inputClass}
                  />
                  <FieldMessage error={touched.no_hp ? profileErrors.no_hp : ""} />
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button type="submit" disabled={savingProfile || emailStatus === "checking" || usernameStatus === "checking" || emailStatus === "unavailable" || usernameStatus === "unavailable"} className={primaryButtonClass}>
                  <Icon name="check" className="h-4 w-4" />
                  {savingProfile ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            </div>
          </form>

          <form onSubmit={submitPassword} className={shellCardClass}>
            <div className={sectionHeaderClass}>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                  <Icon name="lock" className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
                    Keamanan Akun
                  </p>
                  <h3 className="text-xl font-black tracking-tight text-slate-900">
                    Ubah Password
                  </h3>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <div className="grid gap-4">
                <PasswordInput
                  label="Password lama"
                  value={passwordForm.current_password}
                  visible={showCurrentPassword}
                  onToggle={() => setShowCurrentPassword((current) => !current)}
                  onChange={(value) => updatePassword("current_password", value)}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <PasswordInput
                    label="Password baru"
                    value={passwordForm.new_password}
                    visible={showNewPassword}
                    onToggle={() => setShowNewPassword((current) => !current)}
                    onChange={(value) => updatePassword("new_password", value)}
                  />

                  <PasswordInput
                    label="Konfirmasi password baru"
                    value={passwordForm.confirm_password}
                    visible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((current) => !current)}
                    onChange={(value) => updatePassword("confirm_password", value)}
                  />
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-slate-800">Kekuatan password</p>
                    <p className={`text-xs font-black ${passwordStrength.text}`}>{passwordStrength.label}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white ring-1 ring-slate-100">
                    <div className={`h-full rounded-full transition-all duration-500 ${passwordStrength.bar}`} style={{ width: `${Math.max(10, Math.round((passwordScore / passwordChecks.length) * 100))}%` }} />
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {passwordChecks.map((item) => (
                      <div key={item.label} className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold transition ${item.valid ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-white text-slate-500 ring-1 ring-slate-100"}`}>
                        <Icon name={item.valid ? "check" : "x"} className="h-3.5 w-3.5" />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button type="submit" disabled={savingPassword} className={primaryButtonClass}>
                  <Icon name="lock" className="h-4 w-4" />
                  {savingPassword ? "Mengubah..." : "Ubah Password"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
