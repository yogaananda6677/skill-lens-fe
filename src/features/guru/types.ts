export const ACADEMIC_CATEGORIES = [
  "numerik",
  "bahasa",
  "sains",
  "sosial",
  "teknologi",
  "agama",
  "kreativitas",
  "softskill",
] as const;

export type AcademicCategory = (typeof ACADEMIC_CATEGORIES)[number];

export const ACADEMIC_CATEGORY_LABELS: Record<AcademicCategory, string> = {
  numerik: "Numerik",
  bahasa: "Bahasa",
  sains: "Sains",
  sosial: "Sosial",
  teknologi: "Teknologi",
  agama: "Agama",
  kreativitas: "Kreativitas",
  softskill: "Soft skill",
};

export type CategoryScores = Record<AcademicCategory, number>;

export type SchoolRecord = {
  id: string;
  backendId?: number;
  name: string;
  level: "SMA" | "SMK";
  city: string;
  accreditation: string;
  address: string;
  totalStudents: number;
};

export type SemesterGrade = {
  semester: 1 | 2 | 3 | 4 | 5;
  categories: CategoryScores;
  average: number;
  bahasaIndonesia: number;
  bahasaInggris: number;
  matematika: number;
  dll: number;
};

export type CategorySemesterDetail = {
  semester: number;
  bobot: number;
  rata_rata: number;
  jumlah_mapel: number;
  mapel: string[];
};

export type StudentRecord = {
  id: string;
  backendId?: number;
  no: number;
  nisn: string;
  name: string;
  gender: "L" | "P";
  className: string;
  major: string;
  schoolId: string;
  semesterGrades: SemesterGrade[];
  academicCategories: CategoryScores;
  categoryDetails?: Partial<Record<AcademicCategory, CategorySemesterDetail[]>>;
  academicAverage: number;
  fuzzyAcademicLabel: "Tinggi" | "Sedang" | "Perlu dukungan";
  topsisReadiness: number;
  interestSummary: string;
  importStatus: "Valid" | "Perlu Review";
  accountGenerated: boolean;
  backendAccount?: {
    username: string;
    passwordDefault: string;
    isNew: boolean;
    mustChangePassword: boolean;
  };
};

export type GeneratedAccount = {
  studentId: string;
  name: string;
  username: string;
  password: string;
  role: "siswa";
  status: "Siap dikirim" | "Draft";
};

export type SubjectMapping = {
  mapel: string;
  kategori: AcademicCategory;
  source?: "rule" | "manual" | "fallback" | string;
  key?: string;
};

export type ImportDatabaseStats = {
  siswa_dibuat?: number;
  siswa_diupdate?: number;
  mapel_dibuat?: number;
  mapel_diupdate?: number;
  kurikulum_mapel_dibuat?: number;
  nilai_siswa_dibuat?: number;
  nilai_siswa_diupdate?: number;
  nilai_kategori_dibuat?: number;
  nilai_kategori_diupdate?: number;
};

export type ImportPreview = {
  sourceFile: string;
  templateName: string;
  message?: string;
  importMode?: "dry_run" | "import_and_generate" | "mock";
  rowsDetected: number;
  validRows: number;
  reviewRows: number;
  sheetsDetected: string[];
  mappedColumns: string[];
  students: StudentRecord[];
  warnings?: string[];
  semesterWeights?: Record<number, number>;
  mappingMapel?: SubjectMapping[];
  backendMeta?: {
    jumlahSiswa?: number;
    jumlahNilai?: number;
    jumlahMapelTerdeteksi?: number;
    jumlahMapelFallback?: number;
    urutanPenyimpanan?: string[];
    database?: ImportDatabaseStats;
  };
};

export type GuidanceCase = {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  topic: string;
  priority: "Tinggi" | "Sedang" | "Normal";
  status: "Menunggu" | "Dijadwalkan" | "Selesai";
  requestedAt: string;
  schedule: string;
  recommendation: string;
  lastNote: string;
  progress: number;
};

export type GradeSummary = {
  totalStudents: number;
  importedSheets: number;
  averageScore: number;
  reviewNeeded: number;
  readyForTopsis: number;
};
