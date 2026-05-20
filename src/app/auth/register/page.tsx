"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "../../../components/layout/PublicNavbar";
import { Icon } from "../../../components/ui/icons";
import { apiFetch } from "../../../lib/axios";

type RegisterForm = {
  nama: string;
  email: string;
  no_hp: string;
  username: string;
  password: string;
  password_confirmation: string;
};

type FormIcon = "user" | "mail" | "phone" | "profile" | "lock";
type AvailabilityStatus =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "error";

type AvailabilityResponse = {
  username_available?: boolean;
  email_available?: boolean;
  usernameAvailable?: boolean;
  emailAvailable?: boolean;
  message?: string;
};

const initialForm: RegisterForm = {
  nama: "",
  email: "",
  no_hp: "",
  username: "",
  password: "",
  password_confirmation: "",
};

const registerSteps = [
  {
    title: "Buat akun admin sekolah",
    text: "Akun ini digunakan untuk mengelola data awal sekolah.",
    icon: "user",
  },
  {
    title: "Ajukan data sekolah",
    text: "Lengkapi data sekolah agar dapat diverifikasi.",
    icon: "school",
  },
  {
    title: "Kelola guru dan siswa",
    text: "Tambahkan guru dan import data siswa dari Excel.",
    icon: "upload",
  },
];

function normalizePhone(value: string) {
  return value.replace(/[\s\-().]/g, "");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function validateName(value: string) {
  const clean = value.trim();
  if (!clean) return "Nama lengkap wajib diisi.";
  if (clean.length < 3) return "Nama minimal 3 karakter.";
  if (clean.length > 80) return "Nama maksimal 80 karakter.";
  if (!/^[A-Za-zÀ-ÿ\s.'-]+$/.test(clean))
    return "Nama hanya boleh berisi huruf, spasi, titik, petik, atau tanda hubung.";
  return "";
}

function validateEmail(value: string) {
  const clean = value.trim().toLowerCase();
  if (!clean) return "Email wajib diisi.";
  if (clean.length > 120) return "Email maksimal 120 karakter.";
  if (!isValidEmail(clean))
    return "Format email tidak valid. Contoh: admin@sekolah.sch.id";
  return "";
}

function validatePhone(value: string) {
  const clean = normalizePhone(value.trim());
  const digitOnly = clean.replace(/^\+/, "");
  if (!clean) return "Nomor HP wajib diisi.";
  if (!/^(\+62|62|08)[0-9]+$/.test(clean))
    return "Nomor HP harus diawali 08, 62, atau +62.";
  if (!/^[0-9]+$/.test(digitOnly)) return "Nomor HP hanya boleh berisi angka.";
  if (digitOnly.length < 10) return "Nomor HP terlalu pendek, minimal 10 digit.";
  if (digitOnly.length > 15) return "Nomor HP terlalu panjang, maksimal 15 digit.";
  return "";
}

function validateUsername(value: string) {
  const clean = value.trim().toLowerCase();
  if (!clean) return "Username wajib diisi.";
  if (clean.length < 5) return "Username minimal 5 karakter.";
  if (clean.length > 24) return "Username maksimal 24 karakter.";
  if (!/^[a-z]/.test(clean)) return "Username harus diawali huruf.";
  if (!/[0-9]/.test(clean)) return "Username harus memiliki minimal 1 angka.";
  if (!/^[a-z0-9._]+$/.test(clean))
    return "Username hanya boleh huruf kecil, angka, titik, dan underscore.";
  if (/[._]{2,}/.test(clean))
    return "Username tidak boleh memakai titik/underscore berurutan.";
  if (/[._]$/.test(clean))
    return "Username tidak boleh diakhiri titik atau underscore.";
  return "";
}

function getPasswordChecks(
  password: string,
  username: string,
  email: string,
  nama: string
) {
  const lowerPassword = password.toLowerCase();
  const usernameClean = username.trim().toLowerCase();
  const emailName = email.split("@")[0]?.toLowerCase() || "";
  const firstName = nama.trim().split(/\s+/)[0]?.toLowerCase() || "";
  return [
    { label: "Minimal 8 karakter", valid: password.length >= 8 },
    { label: "Mengandung huruf kecil", valid: /[a-z]/.test(password) },
    { label: "Mengandung huruf besar", valid: /[A-Z]/.test(password) },
    { label: "Mengandung angka", valid: /[0-9]/.test(password) },
    { label: "Mengandung simbol", valid: /[^A-Za-z0-9]/.test(password) },
    { label: "Tidak mengandung spasi", valid: password.length > 0 && !/\s/.test(password) },
    {
      label: "Tidak mirip username/email/nama",
      valid:
        password.length > 0 &&
        (!usernameClean || !lowerPassword.includes(usernameClean)) &&
        (!emailName || !lowerPassword.includes(emailName)) &&
        (!firstName || !lowerPassword.includes(firstName)),
    },
  ];
}

function passwordStrengthInfo(score: number) {
  if (score <= 2) return { label: "Lemah", bar: "bg-rose-500", text: "text-rose-400" };
  if (score <= 4) return { label: "Cukup", bar: "bg-amber-500", text: "text-amber-400" };
  if (score <= 6) return { label: "Baik", bar: "bg-blue-500", text: "text-blue-400" };
  return { label: "Sangat aman", bar: "bg-emerald-500", text: "text-emerald-400" };
}

function validateForm(form: RegisterForm) {
  const passwordChecks = getPasswordChecks(
    form.password,
    form.username,
    form.email,
    form.nama
  );
  const passwordScore = passwordChecks.filter((item) => item.valid).length;
  const errors = {
    nama: validateName(form.nama),
    email: validateEmail(form.email),
    no_hp: validatePhone(form.no_hp),
    username: validateUsername(form.username),
    password: "",
    password_confirmation: "",
  };
  if (!form.password) {
    errors.password = "Password wajib diisi.";
  } else if (passwordScore < passwordChecks.length) {
    errors.password = "Password belum memenuhi seluruh syarat keamanan.";
  }
  if (!form.password_confirmation) {
    errors.password_confirmation = "Ulangi password wajib diisi.";
  } else if (form.password !== form.password_confirmation) {
    errors.password_confirmation = "Ulangi password belum sama.";
  }
  return {
    errors,
    passwordChecks,
    passwordScore,
    strength: passwordStrengthInfo(passwordScore),
    isValid:
      !errors.nama &&
      !errors.email &&
      !errors.no_hp &&
      !errors.username &&
      !errors.password &&
      !errors.password_confirmation,
  };
}

function FieldMessage({
  error,
  success,
  loading,
}: {
  error?: string;
  success?: string;
  loading?: string;
}) {
  if (loading) return <p className="mt-2 text-xs font-medium text-cyan-300">{loading}</p>;
  if (error) return <p className="mt-2 text-xs font-medium text-rose-300">{error}</p>;
  if (success) return <p className="mt-2 text-xs font-medium text-emerald-300">{success}</p>;
  return null;
}

function FormInput({
  label,
  icon,
  type = "text",
  value,
  placeholder,
  autoComplete,
  error,
  success,
  loading,
  rightElement,
  onChange,
}: {
  label: string;
  icon: FormIcon;
  type?: string;
  value: string;
  placeholder: string;
  autoComplete?: string;
  error?: string;
  success?: string;
  loading?: string;
  rightElement?: ReactNode;
  onChange: (value: string) => void;
}) {
  const stateClass = error
    ? "border-rose-300/50 focus:border-rose-300 focus:ring-rose-300/10"
    : success
    ? "border-emerald-300/50 focus:border-emerald-300 focus:ring-emerald-300/10"
    : "border-white/10 focus:border-cyan-300 focus:ring-cyan-300/10";

  return (
    <label className="block">
      <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-200">
        <Icon name={icon} className="h-4 w-4 text-cyan-200" />
        {label}
      </span>
      <div className="relative">
        <input
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-2xl border bg-white/10 px-4 py-4 text-sm font-medium !text-white caret-cyan-200 outline-none transition placeholder:text-slate-400 focus:bg-white/15 focus:ring-4 ${
            rightElement ? "pr-20" : ""
          } ${stateClass}`}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      <FieldMessage error={error} success={success} loading={loading} />
    </label>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [touched, setTouched] = useState<Record<keyof RegisterForm, boolean>>({
    nama: false,
    email: false,
    no_hp: false,
    username: false,
    password: false,
    password_confirmation: false,
  });
  const [usernameStatus, setUsernameStatus] = useState<AvailabilityStatus>("idle");
  const [emailStatus, setEmailStatus] = useState<AvailabilityStatus>("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const validation = useMemo(() => validateForm(form), [form]);
  const usernameClean = form.username.trim().toLowerCase();
  const emailClean = form.email.trim().toLowerCase();

  useEffect(() => {
    if (!usernameClean || validation.errors.username) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    const timer = window.setTimeout(async () => {
      try {
        const result = await apiFetch<AvailabilityResponse>(
          `/auth/check-availability?username=${encodeURIComponent(usernameClean)}`,
          { method: "GET", skipAuth: true }
        );
        const available = result.username_available ?? result.usernameAvailable ?? false;
        setUsernameStatus(available ? "available" : "unavailable");
      } catch {
        setUsernameStatus("error");
      }
    }, 550);
    return () => window.clearTimeout(timer);
  }, [usernameClean, validation.errors.username]);

  useEffect(() => {
    if (!emailClean || validation.errors.email) {
      setEmailStatus("idle");
      return;
    }
    setEmailStatus("checking");
    const timer = window.setTimeout(async () => {
      try {
        const result = await apiFetch<AvailabilityResponse>(
          `/auth/check-availability?email=${encodeURIComponent(emailClean)}`,
          { method: "GET", skipAuth: true }
        );
        const available = result.email_available ?? result.emailAvailable ?? false;
        setEmailStatus(available ? "available" : "unavailable");
      } catch {
        setEmailStatus("error");
      }
    }, 550);
    return () => window.clearTimeout(timer);
  }, [emailClean, validation.errors.email]);

  function update(key: keyof RegisterForm, value: string) {
    const nextValue = key === "username" || key === "email" ? value.toLowerCase() : value;
    setForm((current) => ({ ...current, [key]: nextValue }));
    setTouched((current) => ({ ...current, [key]: true }));
  }

  function getFieldError(key: keyof RegisterForm) {
    return touched[key] ? validation.errors[key] : "";
  }

  function getUsernameStatus() {
    if (!touched.username || validation.errors.username) return {};
    if (usernameStatus === "checking") return { loading: "Mengecek username..." };
    if (usernameStatus === "available") return { success: "Username tersedia." };
    if (usernameStatus === "unavailable") return { error: "Username sudah digunakan." };
    if (usernameStatus === "error") return { error: "Gagal mengecek username." };
    return {};
  }

  function getEmailStatus() {
    if (!touched.email || validation.errors.email) return {};
    if (emailStatus === "checking") return { loading: "Mengecek email..." };
    if (emailStatus === "available") return { success: "Email tersedia." };
    if (emailStatus === "unavailable") return { error: "Email sudah digunakan." };
    if (emailStatus === "error") return { error: "Gagal mengecek email." };
    return {};
  }

  const hasAvailabilityProblem =
    usernameStatus === "checking" ||
    usernameStatus === "unavailable" ||
    usernameStatus === "error" ||
    emailStatus === "checking" ||
    emailStatus === "unavailable" ||
    emailStatus === "error";

  const canSubmit =
    validation.isValid && !hasAvailabilityProblem && Object.values(touched).some(Boolean);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({
      nama: true,
      email: true,
      no_hp: true,
      username: true,
      password: true,
      password_confirmation: true,
    });
    setError("");
    setMessage("");
    if (!validation.isValid) {
      setError("Periksa kembali data yang masih belum sesuai.");
      return;
    }
    if (hasAvailabilityProblem) {
      setError("Pastikan username dan email tersedia sebelum mendaftar.");
      return;
    }
    setLoading(true);
    try {
      const result = await apiFetch<{ message?: string }>("/auth/register-admin-sekolah", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
          nama: form.nama.trim(),
          email: emailClean,
          no_hp: normalizePhone(form.no_hp),
          username: usernameClean,
          password: form.password,
          password_confirmation: form.password_confirmation,
        }),
      });
      setMessage(result.message || "Akun admin sekolah berhasil dibuat. Silakan login.");
      setForm(initialForm);
      setTouched({
        nama: false,
        email: false,
        no_hp: false,
        username: false,
        password: false,
        password_confirmation: false,
      });
      setUsernameStatus("idle");
      setEmailStatus("idle");
      setShowPassword(false);
      setShowPasswordConfirmation(false);
      window.setTimeout(() => router.push("/auth/login"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pendaftaran gagal diproses. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const usernameAvailability = getUsernameStatus();
  const emailAvailability = getEmailStatus();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.18),transparent_30%),linear-gradient(135deg,#07111f_0%,#0b1730_48%,#050b16_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute -left-32 top-28 h-80 w-80 rounded-full bg-cyan-400/20 blur-[110px]" />
      <div className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />

      <PublicNavbar />

      <section className="relative z-10 mx-auto flex min-h-screen w-[min(1080px,calc(100%-32px))] items-center justify-center pb-12 pt-32">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[0.92fr_1.08fr]">
          {/* Left side - Informasi pendaftaran */}
          <aside className="relative hidden border-r border-white/10 p-8 lg:block">
            <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="grid h-13 w-13 place-items-center rounded-2xl bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-300/20">
                  <Icon name="target" className="h-6 w-6" />
                </div>
                <p className="mt-7 text-sm font-semibold text-cyan-200">
                  Pendaftaran admin sekolah
                </p>
                <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-white">
                  Daftar sebagai pengelola sekolah
                </h1>
                <p className="mt-4 text-sm font-medium leading-7 text-slate-300">
                  Guru dan siswa tidak melakukan pendaftaran mandiri. Guru
                  ditambahkan oleh admin sekolah, sedangkan siswa dimasukkan
                  melalui import Excel.
                </p>
                <div className="mt-7 space-y-3">
                  {registerSteps.map((item) => (
                    <div
                      key={item.title}
                      className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4"
                    >
                      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cyan-300/15 text-cyan-200">
                        <Icon name={item.icon as any} className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium leading-6 text-slate-300">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 rounded-2xl border border-cyan-200/15 bg-cyan-300/10 p-4">
                <p className="text-sm font-medium leading-6 text-cyan-50">
                  Setelah pendaftaran, lengkapi data sekolah untuk diverifikasi superadmin.
                </p>
              </div>
            </div>
          </aside>

          {/* Right side - Form pendaftaran */}
          <section className="relative p-6 md:p-8 lg:p-10">
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="relative mx-auto max-w-md">
              <p className="text-sm font-semibold text-cyan-200">Form daftar</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
                Buat akun pengelola sekolah
              </h2>
              <p className="mt-3 text-sm font-medium leading-7 text-slate-300">
                Lengkapi data dengan benar. Sistem akan mengecek format input,
                keamanan password, serta ketersediaan username dan email.
              </p>

              <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
                <FormInput
                  label="Nama lengkap"
                  icon="user"
                  value={form.nama}
                  placeholder="Nama admin sekolah"
                  autoComplete="name"
                  error={getFieldError("nama")}
                  onChange={(value) => update("nama", value)}
                />
                <FormInput
                  label="Email aktif"
                  icon="mail"
                  type="email"
                  value={form.email}
                  placeholder="admin@sekolah.sch.id"
                  autoComplete="email"
                  error={getFieldError("email") || emailAvailability.error}
                  success={emailAvailability.success}
                  loading={emailAvailability.loading}
                  onChange={(value) => update("email", value)}
                />
                <FormInput
                  label="Nomor HP"
                  icon="phone"
                  value={form.no_hp}
                  placeholder="08xxxxxxxxxx"
                  autoComplete="tel"
                  error={getFieldError("no_hp")}
                  onChange={(value) => update("no_hp", value)}
                />
                <FormInput
                  label="Username"
                  icon="profile"
                  value={form.username}
                  placeholder="contoh: admin01"
                  autoComplete="username"
                  error={getFieldError("username") || usernameAvailability.error}
                  success={usernameAvailability.success}
                  loading={usernameAvailability.loading}
                  onChange={(value) => update("username", value)}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormInput
                    label="Password"
                    icon="lock"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    error={getFieldError("password")}
                    onChange={(value) => update("password", value)}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-cyan-200"
                        aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                      >
                        <Icon name={showPassword ? "eyeOff" : "eye"} className="h-5 w-5" />
                      </button>
                    }
                  />
                  <FormInput
                    label="Ulangi password"
                    icon="lock"
                    type={showPasswordConfirmation ? "text" : "password"}
                    value={form.password_confirmation}
                    placeholder="Ulangi password"
                    autoComplete="new-password"
                    error={getFieldError("password_confirmation")}
                    onChange={(value) => update("password_confirmation", value)}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirmation((current) => !current)}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-cyan-200"
                        aria-label={showPasswordConfirmation ? "Sembunyikan password" : "Lihat password"}
                      >
                        <Icon name={showPasswordConfirmation ? "eyeOff" : "eye"} className="h-5 w-5" />
                      </button>
                    }
                  />
                </div>

                {/* Bagian keamanan password (hanya satu) */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-300">
                    <span>Keamanan password</span>
                    <span className={validation.strength.text}>
                      {validation.strength.label} ({validation.passwordScore}/7)
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                      <div
                        key={item}
                        className={`h-2 rounded-full transition ${
                          validation.passwordScore >= item
                            ? validation.strength.bar
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {validation.passwordChecks.map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-medium ring-1 ${
                          item.valid
                            ? "text-emerald-400 ring-emerald-500/30"
                            : "text-slate-400 ring-white/10"
                        }`}
                      >
                        <Icon
                          name={item.valid ? "check" : "alert"}
                          className={`h-3.5 w-3.5 ${
                            item.valid ? "text-emerald-400" : "text-slate-500"
                          }`}
                        />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>

                {(message || error) && (
                  <div
                    className={`rounded-2xl p-4 text-sm font-medium leading-6 ${
                      error
                        ? "border border-rose-300/20 bg-rose-500/10 text-rose-200"
                        : "border border-emerald-300/20 bg-emerald-500/10 text-emerald-200"
                    }`}
                  >
                    {error || message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-400/20 transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon name="rocket" className="h-4 w-4" />
                  {loading ? "Mendaftarkan..." : "Daftar Admin Sekolah"}
                </button>

                <p className="text-center text-sm font-medium text-slate-300">
                  Sudah punya akun?{" "}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-cyan-200 hover:text-white"
                  >
                    Masuk di sini
                  </Link>
                </p>
              </form>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}