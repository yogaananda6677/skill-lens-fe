export type AdminSchoolPageKey =
  | "dashboard"
  | "sekolah"
  | "guru"
  | "jurusan"
  | "mata-pelajaran"
  | "import-siswa"
  | "siswa"
  | "nilai";

export type AdminSchoolStatus = {
  has_school: boolean;
  school_status: "none" | "pending" | "approved";
  id_sekolah: number | null;
  nama_sekolah: string | null;
  message: string;
};

export type SchoolForm = {
  nama_sekolah: string;
  npsn: string;
  jenis_sekolah: string;
  alamat: string;
  no_telp: string;
};

export type TeacherForm = {
  nama: string;
  email: string;
  no_hp: string;
  username: string;
  nip: string;
  jabatan: string;
};

export type TeacherRow = {
  id: number;
  nama: string;
  email: string;
  no_hp: string;
  username: string;
  nip: string;
  jabatan: string;
  status?: string;
};

export type JurusanRow = {
  id: number;
  nama: string;
  id_sekolah?: number;
};

export type SiswaRow = {
  id: number;
  id_siswa?: number;
  nisn: string;
  nama: string;
  username?: string;
  password_awal?: string;
  kelas?: string | null;
  jurusan?: string | null;
  id_jurusan?: number | string | null;
  status?: string;
};

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export type ModalState = {
  title: string;
  description: string;
  type?: "success" | "error";
};