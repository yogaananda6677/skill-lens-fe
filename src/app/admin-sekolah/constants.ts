import type { SchoolForm, TeacherForm } from "./types";

export const initialSchoolForm: SchoolForm = {
  nama_sekolah: "",
  npsn: "",
  jenis_sekolah: "SMA",
  alamat: "",
  no_telp: "",
};

export const initialTeacherForm: TeacherForm = {
  nama: "",
  email: "",
  no_hp: "",
  username: "",
  nip: "",
  jabatan: "Guru BK",
};

export const jabatanOptions = [
  "Guru BK",
  "Wali Kelas",
  "Kepala Program Keahlian",
  "Guru Mata Pelajaran",
];

export const templateExcelUrl = "/templates/template-import-siswa.xlsx";