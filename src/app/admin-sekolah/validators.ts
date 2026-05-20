import type { FieldErrors, SchoolForm, TeacherForm } from "./types";
import { jabatanOptions } from "./constants";

export function cleanPhone(value: string) {
  return value.replace(/[\s\-().]/g, "");
}

export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}

export function validateSchool(form: SchoolForm): FieldErrors<SchoolForm> {
  const errors: FieldErrors<SchoolForm> = {};
  const nama = form.nama_sekolah.trim();
  const npsn = form.npsn.trim();
  const noTelp = cleanPhone(form.no_telp.trim());

  if (!nama) errors.nama_sekolah = "Nama sekolah wajib diisi.";
  else if (nama.length < 3)
    errors.nama_sekolah = "Nama sekolah minimal 3 karakter.";
  else if (nama.length > 120)
    errors.nama_sekolah = "Nama sekolah maksimal 120 karakter.";

  if (npsn && !/^[0-9]{8}$/.test(npsn)) {
    errors.npsn = "NPSN harus 8 digit angka.";
  }

  if (!["SMA", "SMK"].includes(form.jenis_sekolah)) {
    errors.jenis_sekolah = "Jenis sekolah hanya boleh SMA atau SMK.";
  }

  if (noTelp) {
    const digitOnly = noTelp.replace(/^\+/, "");

    if (!/^[0-9+]+$/.test(noTelp)) {
      errors.no_telp = "Nomor telepon hanya boleh angka atau tanda +.";
    } else if (digitOnly.length < 6 || digitOnly.length > 15) {
      errors.no_telp = "Nomor telepon harus 6 sampai 15 digit.";
    }
  }

  return errors;
}

export function validateTeacher(form: TeacherForm): FieldErrors<TeacherForm> {
  const errors: FieldErrors<TeacherForm> = {};
  const nama = form.nama.trim();
  const email = form.email.trim().toLowerCase();
  const username = form.username.trim().toLowerCase();
  const noHp = cleanPhone(form.no_hp.trim());
  const nip = form.nip.trim();

  if (!nama) errors.nama = "Nama guru wajib diisi.";
  else if (nama.length < 3) errors.nama = "Nama guru minimal 3 karakter.";
  else if (!/^[A-Za-zÀ-ÿ\s.'-]+$/.test(nama)) {
    errors.nama =
      "Nama hanya boleh huruf, spasi, titik, petik, atau tanda hubung.";
  }

  if (!email) errors.email = "Email wajib diisi.";
  else if (!validEmail(email)) errors.email = "Format email tidak valid.";

  if (noHp) {
    const digitOnly = noHp.replace(/^\+/, "");

    if (!/^(\+62|62|08)[0-9]+$/.test(noHp)) {
      errors.no_hp = "Nomor HP harus diawali 08, 62, atau +62.";
    } else if (digitOnly.length < 10 || digitOnly.length > 15) {
      errors.no_hp = "Nomor HP harus 10 sampai 15 digit.";
    }
  }

  if (!username) errors.username = "Username wajib diisi.";
  else if (username.length < 5)
    errors.username = "Username minimal 5 karakter.";
  else if (!/^[a-z]/.test(username))
    errors.username = "Username harus diawali huruf.";
  else if (!/[0-9]/.test(username))
    errors.username = "Username wajib memiliki minimal 1 angka.";
  else if (!/^[a-z0-9._]+$/.test(username)) {
    errors.username =
      "Username hanya boleh huruf kecil, angka, titik, dan underscore.";
  } else if (/[._]{2,}/.test(username)) {
    errors.username = "Titik/underscore tidak boleh berurutan.";
  } else if (/[._]$/.test(username)) {
    errors.username = "Username tidak boleh diakhiri titik atau underscore.";
  }

  if (!nip) errors.nip = "NIP/NUPTK wajib diisi.";
  else if (nip.length < 5) errors.nip = "NIP/NUPTK minimal 5 karakter.";
  else if (nip.length > 40) errors.nip = "NIP/NUPTK maksimal 40 karakter.";
  else if (!/^[0-9]+$/.test(nip)) errors.nip = "NIP/NUPTK hanya boleh angka.";

  if (!jabatanOptions.includes(form.jabatan)) {
    errors.jabatan = "Jabatan tidak valid.";
  }

  return errors;
}