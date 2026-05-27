"use client";

import { useEffect, useState } from "react";
import type React from "react";

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
}: {
  title?: string;
  subtitle?: string;
}) {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfile);
  const [passwordForm, setPasswordForm] =
    useState<PasswordOtpForm>(emptyPassword);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function loadProfile() {
    setLoading(true);
    setError("");

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
      setError(err instanceof Error ? err.message : "Profil gagal dimuat.");
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

    setMessage("");
    setError("");

    if (!profileForm.nama.trim()) {
      setError("Nama wajib diisi.");
      return;
    }

    if (!profileForm.email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    if (!profileForm.username.trim()) {
      setError("Username wajib diisi.");
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

      setMessage(result.message || "Profil berhasil diperbarui.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profil gagal diperbarui.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function requestOtp() {
    setMessage("");
    setError("");
    setDevOtp("");

    if (!passwordForm.current_password) {
      setError("Isi password lama terlebih dahulu untuk meminta OTP.");
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

      if (result.dev_otp) {
        setDevOtp(result.dev_otp);
        setPasswordForm((current) => ({
          ...current,
          otp: result.dev_otp || current.otp,
        }));
      }

      setMessage(
        result.message ||
          "OTP berhasil dikirim ke email. Kode berlaku selama 10 menit.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal meminta OTP.");
    } finally {
      setSendingOtp(false);
    }
  }

  async function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!passwordForm.current_password) {
      setError("Password lama wajib diisi.");
      return;
    }

    if (!passwordForm.otp || passwordForm.otp.length !== 6) {
      setError("Kode OTP wajib diisi 6 digit.");
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("Konfirmasi password baru tidak sesuai.");
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
      setDevOtp("");
      setMessage(result.message || "Password berhasil diperbarui dengan OTP.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Password gagal diperbarui.",
      );
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Memuat profil...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-[#0a1a3a] to-[#0f2a5f] p-6 text-white shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
          Profil Pengguna
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100">{subtitle}</p>
      </div>

      {(message || error) && (
        <div
          className={`rounded-2xl px-5 py-4 text-sm font-semibold ${
            error
              ? "border border-red-100 bg-red-50 text-red-700"
              : "border border-emerald-100 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="rounded-3xl bg-blue-50 p-6">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-blue-600 text-2xl font-extrabold text-white shadow-lg">
              {initials(user?.nama || "User")}
            </div>

            <h2 className="mt-5 text-2xl font-extrabold text-slate-950">
              {user?.nama}
            </h2>

            <p className="mt-1 text-sm font-semibold text-blue-700">
              {roleLabel(user?.role)}
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Email
                </p>
                <p className="mt-1 break-words font-semibold text-slate-800">
                  {user?.email || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Username
                </p>
                <p className="mt-1 break-words font-semibold text-slate-800">
                  @{user?.username || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
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
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                Data Diri
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-slate-950">
                Ubah Profil
              </h3>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">
                  Nama lengkap
                </span>
                <input
                  value={profileForm.nama}
                  onChange={(event) =>
                    updateProfile("nama", event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">
                  Username
                </span>
                <input
                  value={profileForm.username}
                  onChange={(event) =>
                    updateProfile("username", event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">
                  Email
                </span>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(event) =>
                    updateProfile("email", event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">
                  Nomor HP
                </span>
                <input
                  value={profileForm.no_hp}
                  onChange={(event) =>
                    updateProfile("no_hp", event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {savingProfile ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </div>
          </form>

          <form
            onSubmit={submitPassword}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                Keamanan OTP
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-slate-950">
                Ubah Password dengan OTP
              </h3>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">
                  Password lama
                </span>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.current_password}
                    onChange={(event) =>
                      updatePassword("current_password", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword((current) => !current)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <Icon
                      name={showCurrentPassword ? "eyeOff" : "eye"}
                      className="h-4 w-4"
                    />
                  </button>
                </div>
              </label>

              <div className="flex flex-wrap items-end gap-3">
                <label className="min-w-[180px] flex-1">
                  <span className="mb-1 block text-sm font-semibold text-slate-700">
                    Kode OTP
                  </span>
                  <input
                    value={passwordForm.otp}
                    onChange={(event) =>
                      updatePassword("otp", event.target.value)
                    }
                    placeholder="6 digit"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm tracking-[0.3em] outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </label>

                <button
                  type="button"
                  disabled={sendingOtp}
                  onClick={requestOtp}
                  className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                >
                  {sendingOtp ? "Mengirim OTP..." : "Kirim OTP"}
                </button>
              </div>

              {devOtp && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  Mode development: kode OTP kamu adalah{" "}
                  <span className="font-extrabold tracking-[0.2em]">
                    {devOtp}
                  </span>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-slate-700">
                    Password baru
                  </span>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={(event) =>
                        updatePassword("new_password", event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <Icon
                        name={showNewPassword ? "eyeOff" : "eye"}
                        className="h-4 w-4"
                      />
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-slate-700">
                    Konfirmasi password baru
                  </span>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirm_password}
                      onChange={(event) =>
                        updatePassword("confirm_password", event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
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
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {savingPassword ? "Mengubah..." : "Ubah Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}