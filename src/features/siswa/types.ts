export type AcademicScores = Partial<Record<
  | "numerik"
  | "bahasa"
  | "sains"
  | "sosial"
  | "teknologi"
  | "agama"
  | "kreativitas"
  | "softskill"
  | "praktik",
  number
>>;

export type StudentProfileForm = {
  name: string;
  nisn: string;
  school: string;
  className: string;
  major: string;
  academicScores: AcademicScores;
  interests: string[];
  hobbies: string[];
  talents: string[];
  experiences: string[];
  achievements: string;
  goal: "kuliah" | "kerja" | "wirausaha" | string;
  learningPreference: string;
  constraints: string;
};

export type CriteriaBreakdown = Partial<Record<
  | "akademik"
  | "praktik"
  | "minat"
  | "bakat"
  | "hobi"
  | "pengalaman"
  | "prestasi"
  | "tag_match"
  | "kategori_match",
  number
>>;

export type Recommendation = {
  id: string | number;
  alternativeId?: number;
  roadmapId?: number | null;
  title: string;
  category: "kuliah" | "kerja" | "wirausaha" | string;
  score: number;
  fuzzyLabel: string;
  topsisRank: number;
  summary: string;
  reasons: string[];
  suggestedMajors: string[];
  criteria: CriteriaBreakdown;
  dominantFactors: string[];
};

export type RoadmapDetail = {
  id: number;
  progressId?: number;
  title: string;
  description?: string | null;
  referenceLink?: string | null;
  status: "belum" | "proses" | "selesai" | string;
  completedAt?: string | null;
  notes?: Array<{ id: number; note: string; createdAt?: string | null; guruName?: string | null }>;
};

export type RoadmapStep = {
  id: number;
  title: string;
  description?: string | null;
  order: number;
  details: RoadmapDetail[];
};

export type CareerRoadmap = {
  id: number;
  studentRoadmapId?: number;
  headline: string;
  targetRole: string;
  description?: string | null;
  progress: number;
  steps: RoadmapStep[];
};

export type PublishedRoadmap = {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
};


export type StudentAchievement = {
  id?: number;
  id_prestasi?: number;
  nama_prestasi: string;
  tahun?: string | number | null;
  tingkat?: string | null;
  penyelenggara?: string | null;
  keterangan?: string | null;
  bukti_url?: string | null;
};
export type StudentSubjectScore = {
  id_nilai: number;
  id_kurikulum_mapel?: number | null;
  nama_mapel: string;
  nilai: number;
  semester: number;
  kategori: string;
  kategori_label: string;
};

export type StudentSemesterCategorySummary = {
  kategori: string;
  label: string;
  rata_rata: number | null;
  jumlah_mapel: number;
  mapel: string[];
};

export type StudentSemesterScoreSummary = {
  semester: number;
  kategori: Record<string, StudentSemesterCategorySummary>;
  rata_rata: number | null;
  jumlah_mapel: number;
};

export type StudentAcademicDetailResponse = {
  data: StudentSubjectScore[];
  per_semester: StudentSemesterScoreSummary[];
  semester_options: number[];
  summary: {
    rata_rata: number | null;
    jumlah_mapel: number;
    semester_terbaru: number | null;
  };
};
