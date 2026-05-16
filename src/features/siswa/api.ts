import { apiFetch } from "../../lib/axios";
import type { AcademicScores, CareerRoadmap, Recommendation, StudentProfileForm } from "./types";

function safeString(value: unknown, defaultValue: string): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return JSON.stringify(value);
  if (value === null || value === undefined) return defaultValue;
  return String(value);
}

type SekolahRaw =
  | string
  | null
  | {
      id?: number | string;
      nama?: string | null;
      status?: string | null;
    };

export type SiswaMeResponse = {
  id_siswa: number;
  nisn: string;
  nama: string;
  sekolah?: SekolahRaw;
  kelas: string;
  jurusan: string;
  minat?: string[];
  hobi?: string[];
  bakat?: string[];
  skill?: string[];
  prestasi?: string;
  tujuan?: string;
  preferensi_belajar?: string;
  kendala?: string;
  nilai_akademik?: AcademicScores;
};

export type SiswaProfilePayload = {
  minat: string[];
  hobi: string[];
  bakat: string[];
  skill: string[];
  prestasi: string;
  tujuan: string;
  preferensi_belajar: string;
  kendala: string;
};

export async function getSiswaMe() {
  return apiFetch<SiswaMeResponse>("/siswa/me");
}

export async function saveSiswaProfile(payload: SiswaProfilePayload) {
  return apiFetch<{ message: string }>("/siswa/profil", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

type SpkRawCriteria = {
  academic?: unknown;
  akademik?: unknown;
  interest?: unknown;
  minat?: unknown;
  talentSkill?: unknown;
  bakat_skill?: unknown;
  skill?: unknown;
  goalFit?: unknown;
  tujuan?: unknown;
};

type SpkRawRecommendation = {
  id?: unknown;
  career_id?: unknown;
  kode?: unknown;

  title?: unknown;
  nama?: unknown;
  label?: unknown;

  category?: unknown;
  kategori?: unknown;

  score?: unknown;
  nilai?: unknown;
  skor?: unknown;

  fuzzyLabel?: unknown;
  fuzzy_label?: unknown;
  status?: unknown;

  topsisRank?: unknown;
  rank?: unknown;

  summary?: unknown;
  ringkasan?: unknown;
  deskripsi?: unknown;

  reasons?: unknown;
  alasan?: unknown;

  suggestedMajors?: unknown;
  jurusan_saran?: unknown;

  criteria?: SpkRawCriteria;
  kriteria?: SpkRawCriteria;

  dominantFactors?: unknown;
  faktor_dominan?: unknown;

  [key: string]: unknown;
};

function toNumberSafe(value: unknown, defaultValue = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : defaultValue;
}

function normalizeRecommendation(item: SpkRawRecommendation, index: number): Recommendation {
  const criteria = (item.criteria ?? item.kriteria ?? {}) as SpkRawCriteria;

  return {
    id: String(item.id ?? item.career_id ?? item.kode ?? `rec-${index + 1}`),
    title: safeString(item.title ?? item.nama ?? item.label, `Rekomendasi ${index + 1}`),
    category: safeString(item.category ?? item.kategori, "Karier"),
    score: toNumberSafe(item.score ?? item.nilai ?? item.skor, 0),
    fuzzyLabel: safeString(item.fuzzyLabel ?? item.fuzzy_label ?? item.status, "Diproses"),
    topsisRank: toNumberSafe(item.topsisRank ?? item.rank ?? index + 1, index + 1),
    summary: safeString(
      item.summary ?? item.ringkasan ?? item.deskripsi,
      "Hasil rekomendasi dari layanan SPK Python.",
    ),
    reasons: Array.isArray(item.reasons)
      ? (item.reasons as unknown[]).map((r) => String(r))
      : Array.isArray(item.alasan)
        ? (item.alasan as unknown[]).map((r) => String(r))
        : [],
    suggestedMajors: Array.isArray(item.suggestedMajors)
      ? (item.suggestedMajors as unknown[]).map((m) => String(m))
      : Array.isArray(item.jurusan_saran)
        ? (item.jurusan_saran as unknown[]).map((m) => String(m))
        : [],
    criteria: {
      academic: toNumberSafe(criteria.academic ?? criteria.akademik, 0),
      interest: toNumberSafe(criteria.interest ?? criteria.minat, 0),
      talentSkill: toNumberSafe(criteria.talentSkill ?? criteria.bakat_skill ?? criteria.skill, 0),
      goalFit: toNumberSafe(criteria.goalFit ?? criteria.tujuan, 0),
    },
    dominantFactors: Array.isArray(item.dominantFactors)
      ? (item.dominantFactors as unknown[]).map((d) => String(d))
      : Array.isArray(item.faktor_dominan)
        ? (item.faktor_dominan as unknown[]).map((d) => String(d))
        : [],
  };
}

export async function processSiswaSpk(payload: SiswaProfilePayload) {
  const response = await apiFetch<{
    message: string;
    data?: unknown;
  }>("/siswa/spk", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const maybeData = response.data as Record<string, unknown> | unknown;
  const raw =
    (typeof maybeData === "object" && maybeData !== null
      ? (maybeData as Record<string, unknown>).recommendations
      : undefined) ??
    (typeof maybeData === "object" && maybeData !== null
      ? (maybeData as Record<string, unknown>).rekomendasi
      : undefined) ??
    (maybeData as unknown[] | undefined) ??
    [];

  const list = Array.isArray(raw) ? raw : [];

  return {
    message: response.message,
    recommendations: list.map(normalizeRecommendation),
  };
}

function toSekolahName(sekolah: SiswaMeResponse["sekolah"]): string {
  if (typeof sekolah === "string") return sekolah;
  if (sekolah && typeof sekolah === "object") return String(sekolah.nama ?? "");
  return "";
}

export function toStudentProfile(data: SiswaMeResponse): StudentProfileForm {
  return {
    name: data.nama ?? "",
    nisn: data.nisn ?? "",
    school: toSekolahName(data.sekolah),
    className: data.kelas ?? "",
    major: data.jurusan ?? "",
    academicScores: data.nilai_akademik ?? {},
    interests: data.minat ?? [],
    hobbies: data.hobi ?? [],
    talents: data.bakat ?? [],
    skills: data.skill ?? [],
    achievements: data.prestasi ?? "",
    goal: data.tujuan ?? "",
    learningPreference: data.preferensi_belajar ?? "",
    constraints: data.kendala ?? "",
  };
}

export async function getSiswaRoadmap(careerId: string): Promise<CareerRoadmap> {
  return apiFetch<CareerRoadmap>(`/siswa/roadmap?careerId=${encodeURIComponent(careerId)}`);
}

export const careerRoadmaps: Record<string, CareerRoadmap> = {
  default: {
    careerId: "default",
    headline: "Roadmap Pengembangan Diri",
    targetRole: "Pilihan lanjutan sesuai rekomendasi SPK",
    initialCompleted: 0,
    steps: [
      {
        id: "validasi",
        phase: "Tahap 1",
        title: "Validasi hasil rekomendasi",
        description: "Diskusikan hasil SPK dengan guru pembimbing agar pilihan sesuai kondisi akademik dan rencana pribadi.",
        duration: "1 minggu",
        output: "Pilihan utama tervalidasi",
        checklist: ["Baca hasil rekomendasi", "Catat alasan pilihan", "Diskusi dengan guru"],
      },
      {
        id: "rencana",
        phase: "Tahap 2",
        title: "Susun rencana belajar",
        description: "Tentukan kompetensi awal yang perlu diperkuat sesuai arah rekomendasi.",
        duration: "2 minggu",
        output: "Daftar target belajar",
        checklist: ["Pilih kompetensi", "Tentukan jadwal", "Cari sumber belajar"],
      },
      {
        id: "portofolio",
        phase: "Tahap 3",
        title: "Mulai portofolio awal",
        description: "Buat satu bukti karya sederhana untuk mendukung pilihan kuliah, kerja, atau pelatihan.",
        duration: "1 bulan",
        output: "Portofolio awal",
        checklist: ["Pilih proyek", "Kerjakan bertahap", "Dokumentasikan hasil"],
      },
    ],
  },
};

export function getRoadmapForCareer(careerId: string): CareerRoadmap {
  return careerRoadmaps[careerId] ?? { ...careerRoadmaps.default, careerId };
}
