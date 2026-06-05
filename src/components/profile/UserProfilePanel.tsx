"use client";

import { useEffect, useState } from "react";
import type React from "react";

import { notifyAppAlert } from "../../lib/app-alert-events";
import { apiFetch } from "../../lib/axios";
import { persistAuth, type AuthRole } from "../../lib/auth";
import { Icon } from "../ui/icons";

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

type PasswordOtpForm = {
  current_password: string;
  otp: string;
  new_password: string;
  confirm_password: string;
};

const emptyProfile: ProfileForm = {
  nama: "",
  email: "",
  username: "",
  no_hp: "",
};

const emptyPassword: PasswordOtpForm = {
  current_password: "",
  otp: "",
  new_password: "",
  confirm_password: "",
};

const shellCardClass =
  "overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60";

const sectionHeaderClass =
  "border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-5";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-3 text-sm font-extrabold text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50";

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-sky-200 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50";

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

function cleanPhone(value: string) {
  return value.replace(/[^\d+]/g, "");
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
    useState<PasswordOtpForm>(emptyPassword);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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
    setProfileForm((current) => ({
      ...current,
      [key]:
        key === "email" || key === "username" ? value.toLowerCase() : value,
    }));
  }

  function updatePassword(key: keyof PasswordOtpForm, value: string) {
    setPasswordForm((current) => ({
      ...current,
      [key]: key === "otp" ? value.replace(/\D/g, "").slice(0, 6) : value,
    }));
  }

  async function submitProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profileForm.nama.trim()) {
      notifyAppAlert({
        type: "error",
        title: "Nama wajib diisi",
        autoCloseMs: 2400,
      });
      return;
    }

    if (!profileForm.email.trim()) {
      notifyAppAlert({
        type: "error",
        title: "Email wajib diisi",
        autoCloseMs: 2400,
      });
      return;
    }

    if (!profileForm.username.trim()) {
      notifyAppAlert({
        type: "error",
        title: "Username wajib diisi",
        autoCloseMs: 2400,
      });
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
          no_hp: cleanPhone(profileForm.no_hp.trim()),
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

  async function requestOtp() {
    if (!passwordForm.current_password) {
      notifyAppAlert({
        type: "error",
        title: "Password lama wajib diisi",
        description: "Isi password lama terlebih dahulu untuk meminta OTP.",
        autoCloseMs: 2400,
      });
      return;
    }

    setSendingOtp(true);

    try {
      const result = await apiFetch<{
        message?: string;
        dev_otp?: string;
        expires_in_minutes?: number;
      }>("/auth/request-password-otp", {
        method: "POST",
        body: JSON.stringify({
          current_password: passwordForm.current_password,
        }),
        successMessage: false,
        errorMessage: false,
      });

      notifyAppAlert({
        type: "success",
        title: "Kode OTP telah dikirim",
        description: result.message || "Silakan cek email Anda.",
        autoCloseMs: 2600,
      });
    } catch (err) {
      notifyAppAlert({
        type: "error",
        title: "Gagal meminta OTP",
        description: err instanceof Error ? err.message : "Gagal meminta OTP.",
        autoCloseMs: false,
      });
    } finally {
      setSendingOtp(false);
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

    if (!passwordForm.otp || passwordForm.otp.length !== 6) {
      notifyAppAlert({
        type: "error",
        title: "Kode OTP wajib diisi 6 digit",
        autoCloseMs: 2400,
      });
      return;
    }

    if (passwordForm.new_password.length < 8) {
      notifyAppAlert({
        type: "error",
        title: "Password baru minimal 8 karakter",
        autoCloseMs: 2400,
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
      const result = await apiFetch<{ message?: string }>(
        "/auth/change-password-with-otp",
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

      notifyAppAlert({
        type: "success",
        title: "Password berhasil diperbarui",
        description: result.message || "Password berhasil diperbarui dengan OTP.",
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
    return (
      <div className="grid min-h-[360px] place-items-center rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Memuat profil...
          </p>
        </div>
      </div>
    );
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
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Username
                  </span>
                  <input
                    value={profileForm.username}
                    onChange={(event) => updateProfile("username", event.target.value)}
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Email
                  </span>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => updateProfile("email", event.target.value)}
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Nomor HP
                  </span>
                  <input
                    value={profileForm.no_hp}
                    onChange={(event) => updateProfile("no_hp", event.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button type="submit" disabled={savingProfile} className={primaryButtonClass}>
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
                    Keamanan OTP
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

                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-slate-700">
                      Kode OTP
                    </span>
                    <input
                      value={passwordForm.otp}
                      onChange={(event) => updatePassword("otp", event.target.value)}
                      placeholder="6 digit"
                      className={`${inputClass} font-black tracking-[0.3em] placeholder:tracking-normal`}
                    />
                  </label>

                  <button type="button" disabled={sendingOtp} onClick={requestOtp} className={secondaryButtonClass}>
                    <Icon name="mail" className="h-4 w-4" />
                    {sendingOtp ? "Mengirim OTP..." : "Kirim OTP"}
                  </button>
                </div>

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
