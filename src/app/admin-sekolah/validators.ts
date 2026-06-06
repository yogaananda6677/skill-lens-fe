import { jabatanOptions } from "./constants";
import type { FieldErrors, SchoolForm, TeacherForm } from "./types";
import {
  normalizePhone,
  validateEmail,
  validateName,
  validatePhone,
  validateUsername,
} from "../../lib/form-rules";

export const cleanPhone = normalizePhone;

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}

export function slugUsername(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s._-]/g, "")
    .trim()
    .replace(/[\s-]+/g, ".")
    .replace(/[^a-z0-9._]/g, "")
    .replace(/[._]{2,}/g, ".")
    .replace(/^[._]+|[._]+$/g, "");
}

export function buildTeacherUsername(form: Pick<TeacherForm, "nama" | "nip">) {
  const baseName = slugUsername(form.nama)
    .split(".")
    .filter(Boolean)
    .slice(0, 2)
    .join(".");
  const suffix = form.nip.replace(/\D/g, "").slice(-4) || "01";

  return `${baseName || "guru"}${suffix}`.slice(0, 24).replace(/[._]$/g, "");
}

export function validateSchool(form: SchoolForm): FieldErrors<SchoolForm> {
  const errors: FieldErrors<SchoolForm> = {};
  const nama = form.nama_sekolah.trim();
  const npsn = form.npsn.trim();
  const noTelp = cleanPhone(form.no_telp.trim());

  if (!nama) errors.nama_sekolah = "Nama sekolah wajib diisi.";
  else if (nama.length < 3) errors.nama_sekolah = "Nama sekolah minimal 3 karakter.";
  else if (nama.length > 120) errors.nama_sekolah = "Nama sekolah maksimal 120 karakter.";

  if (npsn && !/^[0-9]{8}$/.test(npsn)) errors.npsn = "NPSN harus 8 digit angka.";
  if (!["SMA", "SMK"].includes(form.jenis_sekolah)) errors.jenis_sekolah = "Jenis sekolah hanya boleh SMA atau SMK.";

  if (noTelp) {
    const digitOnly = noTelp.replace(/^\+/, "");

    if (!/^[0-9+]+$/.test(noTelp)) errors.no_telp = "Nomor telepon hanya boleh angka atau tanda +.";
    else if (digitOnly.length < 6 || digitOnly.length > 15) errors.no_telp = "Nomor telepon harus 6 sampai 15 digit.";
  }

  return errors;
}

export function validateTeacher(form: TeacherForm): FieldErrors<TeacherForm> {
  const errors: FieldErrors<TeacherForm> = {};
  const nip = form.nip.trim();

  const nameError = validateName(form.nama);
  const emailError = validateEmail(form.email, "guru@sekolah.sch.id");
  const phoneError = validatePhone(form.no_hp);
  const usernameError = validateUsername(form.username, { requireNumber: true });

  if (nameError) errors.nama = nameError.replace("Nama lengkap", "Nama guru");
  if (emailError) errors.email = emailError;
  if (phoneError) errors.no_hp = phoneError;
  if (usernameError) errors.username = usernameError;

  if (!nip) errors.nip = "NIP/NUPTK wajib diisi.";
  else if (nip.length < 5) errors.nip = "NIP/NUPTK minimal 5 karakter.";
  else if (nip.length > 40) errors.nip = "NIP/NUPTK maksimal 40 karakter.";
  else if (!/^[0-9]+$/.test(nip)) errors.nip = "NIP/NUPTK hanya boleh angka.";

  if (!jabatanOptions.includes(form.jabatan)) errors.jabatan = "Jabatan tidak valid.";

  return errors;
}
