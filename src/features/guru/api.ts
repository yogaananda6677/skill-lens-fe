import { apiFetch } from "../../lib/axios";

export type SchoolRecord = {
  id: string;
  backendId: number;
  name: string;
  level: "SMA" | "SMK" | string;
  city: string;
  accreditation: string;
  address: string;
  totalStudents: number;
  status?: string;
};

export type MajorRecord = {
  id: string;
  backendId: number;
  name: string;
  schoolId: number;
  schoolName?: string;
};

export type GuruWorkspace = {
  guru: {
    id_guru: number;
    nama: string;
    email: string;
    nip: string;
    jabatan: string | null;
  };
  sekolah: null | {
    id: number;
    nama: string;
    jenis: string | null;
    alamat: string | null;
    status: "pending" | "approved";
  };
  canAccessWorkspace: boolean;
  lockReason: string | null;
  stats: {
    siswa: number;
    jurusan: number;
    dataValid: number;
    perluReview: number;
  };
  jurusan: Array<{ id: number; nama: string }>;
};

export type GuidanceCase = {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  topic: string;
  priority: string;
  status: string;
  requestedAt: string;
  schedule: string;
  recommendation: string;
  lastNote: string;
  progress: number;
};

export type ImportPreview = {
  message: string;
  meta?: {
    jumlah_siswa?: number;
    jumlah_nilai?: number;
    semester_terbaca?: number[];
  };
  warnings?: string[];
  data?: Array<{
    nisn: string;
    nama: string;
    kelas?: string;
    jurusan?: string;
    id_siswa?: number;
    akun?: { username: string; password_default: string; akun_baru: boolean };
    nilai_akademik?: Record<string, number>;
  }>;
};

export type GeneratedAccount = {
  nisn: string;
  nama: string;
  username: string;
  password_default: string;
  akun_baru: boolean;
};

export async function getGuruWorkspace() {
  return apiFetch<GuruWorkspace>("/guru/workspace");
}

export async function getApprovedSchools() {
  return apiFetch<SchoolRecord[]>("/sekolah/approved");
}

export async function getMajorsBySchool(schoolId: number | string) {
  return apiFetch<MajorRecord[]>(`/jurusan?sekolahId=${schoolId}`);
}

export async function chooseSchool(id_sekolah: number | string) {
  return apiFetch<{ message: string }>("/guru/pilih-sekolah", {
    method: "POST",
    body: JSON.stringify({ id_sekolah }),
  });
}

export async function requestNewSchool(payload: {
  nama_sekolah: string;
  jenis_sekolah: "SMA" | "SMK";
  npsn?: string;
  alamat?: string;
  no_hp_sekolah?: string;
}) {
  return apiFetch<{ message: string }>("/guru/ajukan-sekolah", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getGuidanceCases() {
  return apiFetch<GuidanceCase[]>("/guru/guidance-cases");
}

export async function importExcelGrades(payload: {
  file: File;
  dryRun: boolean;
  tahunAjaran: string;
  jenisSekolah?: string;
  jurusan: string;
  sekolahId: string | number;
  jurusanId?: string | number;
}) {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("dryRun", payload.dryRun ? "true" : "false");
  formData.append("tahunAjaran", payload.tahunAjaran);
  if (payload.jenisSekolah) formData.append("jenisSekolah", payload.jenisSekolah);
  formData.append("jurusan", payload.jurusan);
  formData.append("sekolahId", String(payload.sekolahId));
  if (payload.jurusanId) formData.append("jurusanId", String(payload.jurusanId));
  formData.append("semesterWeights", JSON.stringify({ 1: 0.1, 2: 0.15, 3: 0.2, 4: 0.25, 5: 0.3 }));

  return apiFetch<ImportPreview>("/nilai-siswa/import-excel", {
    method: "POST",
    body: formData,
  });
}

export function extractAccounts(response: ImportPreview): GeneratedAccount[] {
  return (response.data ?? [])
    .filter((item) => item.akun)
    .map((item) => ({
      nisn: item.nisn,
      nama: item.nama,
      username: item.akun!.username,
      password_default: item.akun!.password_default,
      akun_baru: item.akun!.akun_baru,
    }));
}

export async function getGuruJurusan() {
  return apiFetch<Array<{ id: number; nama: string }>>("/guru/jurusan");
}

export async function createGuruJurusan(nama: string) {
  return apiFetch<{ message: string; data: { id: number; nama: string } }>("/guru/jurusan", {
    method: "POST",
    body: JSON.stringify({ nama }),
  });
}

export async function updateGuruJurusan(id: number, nama: string) {
  return apiFetch<{ message: string; data: { id: number; nama: string } }>(`/guru/jurusan/${id}`, {
    method: "PUT",
    body: JSON.stringify({ nama }),
  });
}

export async function deleteGuruJurusan(id: number) {
  return apiFetch<{ message: string }>(`/guru/jurusan/${id}`, {
    method: "DELETE",
  });
}
