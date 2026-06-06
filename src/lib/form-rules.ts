// Shared validation and availability helpers for frontend forms.
export type AvailabilityStatus = "idle" | "checking" | "available" | "unavailable" | "error";

export type AvailabilityResponse = {
  username_available?: boolean;
  email_available?: boolean;
  usernameAvailable?: boolean;
  emailAvailable?: boolean;
  message?: string;
};

export type FieldMessageState = {
  error?: string;
  success?: string;
  loading?: string;
};

export type PasswordCheck = {
  label: string;
  valid: boolean;
};

export function normalizePhone(value: string) {
  return value.replace(/[\s\-().]/g, "");
}

export function cleanPhoneInput(value: string, maxLength = 16) {
  return value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "").slice(0, maxLength);
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function validateName(value: string) {
  const clean = value.trim();
  if (!clean) return "Nama lengkap wajib diisi.";
  if (clean.length < 3) return "Nama minimal 3 karakter.";
  if (clean.length > 80) return "Nama maksimal 80 karakter.";
  if (!/^[A-Za-zÀ-ÿ\s.'-]+$/.test(clean)) {
    return "Nama hanya boleh berisi huruf, spasi, titik, petik, atau tanda hubung.";
  }
  return "";
}

export function validateEmail(value: string, example = "nama@domain.com") {
  const clean = value.trim().toLowerCase();
  if (!clean) return "Email wajib diisi.";
  if (clean.length > 120) return "Email maksimal 120 karakter.";
  if (!isValidEmail(clean)) return `Format email belum valid. Contoh: ${example}`;
  return "";
}

export function validatePhone(value: string, options: { required?: boolean } = {}) {
  const clean = normalizePhone(value.trim());
  const digits = clean.replace(/^\+/, "");

  if (!clean) return options.required ? "Nomor HP wajib diisi." : "";
  if (!/^(\+62|62|08)[0-9]+$/.test(clean)) return "Nomor HP harus diawali 08, 62, atau +62.";
  if (!/^[0-9]+$/.test(digits)) return "Nomor HP hanya boleh angka.";
  if (digits.length < 10) return "Nomor HP terlalu pendek, minimal 10 digit.";
  if (digits.length > 15) return "Nomor HP terlalu panjang, maksimal 15 digit.";
  return "";
}

export function validateUsername(value: string, options: { requireNumber?: boolean } = {}) {
  const clean = value.trim().toLowerCase();
  if (!clean) return "Username wajib diisi.";
  if (clean.length < 5) return "Username minimal 5 karakter.";
  if (clean.length > 24) return "Username maksimal 24 karakter.";
  if (!/^[a-z]/.test(clean)) return "Username harus diawali huruf.";
  if (options.requireNumber && !/[0-9]/.test(clean)) return "Username harus memiliki minimal 1 angka.";
  if (!/^[a-z0-9._]+$/.test(clean)) return "Username hanya boleh huruf kecil, angka, titik, dan underscore.";
  if (/[._]{2,}/.test(clean)) return "Username tidak boleh memakai titik/underscore berurutan.";
  if (/[._]$/.test(clean)) return "Username tidak boleh diakhiri titik atau underscore.";
  return "";
}

export function getPasswordChecks(
  password: string,
  identity: { username?: string; email?: string; name?: string } = {},
): PasswordCheck[] {
  const lowerPassword = password.toLowerCase();
  const username = identity.username?.trim().toLowerCase() || "";
  const emailName = identity.email?.split("@")[0]?.toLowerCase() || "";
  const firstName = identity.name?.trim().split(/\s+/)[0]?.toLowerCase() || "";

  const checks: PasswordCheck[] = [
    { label: "Minimal 8 karakter", valid: password.length >= 8 },
    { label: "Ada huruf kecil", valid: /[a-z]/.test(password) },
    { label: "Ada huruf besar", valid: /[A-Z]/.test(password) },
    { label: "Ada angka", valid: /[0-9]/.test(password) },
    { label: "Ada simbol", valid: /[^A-Za-z0-9]/.test(password) },
    { label: "Tanpa spasi", valid: password.length > 0 && !/\s/.test(password) },
  ];

  if (username || emailName || firstName) {
    checks.push({
      label: "Tidak mirip data akun",
      valid:
        password.length > 0 &&
        (!username || !lowerPassword.includes(username)) &&
        (!emailName || !lowerPassword.includes(emailName)) &&
        (!firstName || !lowerPassword.includes(firstName)),
    });
  }

  return checks;
}

export function getPasswordStrength(score: number, total = 7) {
  const ratio = total > 0 ? score / total : 0;
  if (ratio <= 0.35) return { label: "Lemah", bar: "bg-rose-500", text: "text-rose-600" };
  if (ratio <= 0.62) return { label: "Cukup", bar: "bg-amber-500", text: "text-amber-600" };
  if (ratio < 1) return { label: "Baik", bar: "bg-sky-500", text: "text-sky-600" };
  return { label: "Sangat aman", bar: "bg-emerald-500", text: "text-emerald-600" };
}

export function getAvailabilityValue(result: AvailabilityResponse, type: "email" | "username") {
  if (type === "email") return Boolean(result.email_available ?? result.emailAvailable);
  return Boolean(result.username_available ?? result.usernameAvailable);
}

export function availabilityMessage(status: AvailabilityStatus, type: "email" | "username"): FieldMessageState {
  const label = type === "email" ? "Email" : "Username";
  const object = type === "email" ? "email" : "username";

  if (status === "checking") return { loading: `Mengecek ${object}...` };
  if (status === "available") return { success: `${label} tersedia.` };
  if (status === "unavailable") return { error: `${label} sudah digunakan.` };
  if (status === "error") return { error: `Gagal mengecek ${object}.` };
  return {};
}
