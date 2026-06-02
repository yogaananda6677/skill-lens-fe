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

const primaryGradient =
  "bg-[linear-gradient(135deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)]";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-700/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 px-5 py-3 text-sm font-extrabold text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50";

const inputClass =
  "w-full rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-sky-200 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";

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
      <div className="grid min-h-[360px] place-items-center rounded-[2rem] border border-sky-100 bg-white shadow-xl shadow-sky-950/5">
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
      {showHeader && (
        <div
          className={`relative overflow-hidden rounded-[2rem] p-6 text-white shadow-xl shadow-sky-700/20 ${primaryGradient}`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:42px_42px] opacity-35" />
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-200/25 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
              Profil Pengguna
            </p>

            <h1 className="mt-2 text-3xl font-extrabold">{title}</h1>

            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-sky-100/85">
              {subtitle}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <aside className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-xl shadow-sky-950/5">
          <div className="bg-[linear-gradient(180deg,#dff4ff_0%,#eef9ff_48%,#ffffff_100%)] p-6">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-[linear-gradient(135deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)] text-2xl font-extrabold text-white shadow-lg shadow-sky-700/25">
              {initials(user?.nama || "User")}
            </div>

            <h2 className="mt-5 text-2xl font-extrabold text-slate-950">
              {user?.nama || "Pengguna"}
            </h2>

            <p className="mt-1 text-sm font-bold text-sky-700">
              {roleLabel(user?.role)}
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-sky-100">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Email
                </p>
                <p className="mt-1 break-words font-semibold text-slate-800">
                  {user?.email || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-sky-100">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Username
                </p>
                <p className="mt-1 break-words font-semibold text-slate-800">
                  @{user?.username || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-sky-100">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Nomor HP
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {user?.no_hp || "Belum diisi"}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <form
            onSubmit={submitProfile}
            className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-xl shadow-sky-950/5"
          >
            <div className="border-b border-sky-100 bg-[linear-gradient(135deg,#dbeafe_0%,#bfdbfe_45%,#7dd3fc_100%)] px-6 py-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#08224f]">
                Data Diri
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-slate-950">
                Ubah Profil
              </h3>
            </div>

            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Nama lengkap
                  </span>
                  <input
                    value={profileForm.nama}
                    onChange={(event) =>
                      updateProfile("nama", event.target.value)
                    }
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Username
                  </span>
                  <input
                    value={profileForm.username}
                    onChange={(event) =>
                      updateProfile("username", event.target.value)
                    }
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
                    onChange={(event) =>
                      updateProfile("email", event.target.value)
                    }
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Nomor HP
                  </span>
                  <input
                    value={profileForm.no_hp}
                    onChange={(event) =>
                      updateProfile("no_hp", event.target.value)
                    }
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className={primaryButtonClass}
                >
                  {savingProfile ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            </div>
          </form>

          <form
            onSubmit={submitPassword}
            className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-xl shadow-sky-950/5"
          >
            <div className="border-b border-sky-100 bg-[linear-gradient(135deg,#dbeafe_0%,#bfdbfe_45%,#7dd3fc_100%)] px-6 py-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#08224f]">
                Keamanan OTP
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-slate-950">
                Ubah Password dengan OTP
              </h3>
            </div>

            <div className="p-6">
              <div className="grid gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Password lama
                  </span>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.current_password}
                      onChange={(event) =>
                        updatePassword("current_password", event.target.value)
                      }
                      className={`${inputClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-sky-50 hover:text-sky-700"
                    >
                      <Icon
                        name={showCurrentPassword ? "eyeOff" : "eye"}
                        className="h-4 w-4"
                      />
                    </button>
                  </div>
                </label>

                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-slate-700">
                      Kode OTP
                    </span>
                    <input
                      value={passwordForm.otp}
                      onChange={(event) =>
                        updatePassword("otp", event.target.value)
                      }
                      placeholder="6 digit"
                      className={`${inputClass} font-bold tracking-[0.3em] placeholder:tracking-normal`}
                    />
                  </label>

                  <button
                    type="button"
                    disabled={sendingOtp}
                    onClick={requestOtp}
                    className={secondaryButtonClass}
                  >
                    {sendingOtp ? "Mengirim OTP..." : "Kirim OTP"}
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-slate-700">
                      Password baru
                    </span>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.new_password}
                        onChange={(event) =>
                          updatePassword("new_password", event.target.value)
                        }
                        className={`${inputClass} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowNewPassword((current) => !current)
                        }
                        className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-sky-50 hover:text-sky-700"
                      >
                        <Icon
                          name={showNewPassword ? "eyeOff" : "eye"}
                          className="h-4 w-4"
                        />
                      </button>
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-slate-700">
                      Konfirmasi password baru
                    </span>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirm_password}
                        onChange={(event) =>
                          updatePassword("confirm_password", event.target.value)
                        }
                        className={`${inputClass} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((current) => !current)
                        }
                        className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-sky-50 hover:text-sky-700"
                      >
                        <Icon
                          name={showConfirmPassword ? "eyeOff" : "eye"}
                          className="h-4 w-4"
                        />
                      </button>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className={primaryButtonClass}
                >
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
