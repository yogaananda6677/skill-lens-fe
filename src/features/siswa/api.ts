import { apiFetch } from "../../lib/axios";
import type { AcademicScores, CareerRoadmap, Recommendation, StudentProfileForm } from "./types";

export type SiswaMeResponse = {
  id_siswa: number;
  nisn: string;
  nama: string;
  sekolah?: string | null;
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

function normalizeRecommendation(item: any, index: number): Recommendation {
  const criteria = item?.criteria ?? item?.kriteria ?? {};
  return {
    id: String(item?.id ?? item?.career_id ?? item?.kode ?? `rec-${index + 1}`),
    title: String(item?.title ?? item?.nama ?? item?.label ?? `Rekomendasi ${index + 1}`),
    category: item?.category ?? item?.kategori ?? "Karier",
    score: Number(item?.score ?? item?.nilai ?? item?.skor ?? 0),
    fuzzyLabel: String(item?.fuzzyLabel ?? item?.fuzzy_label ?? item?.status ?? "Diproses"),
    topsisRank: Number(item?.topsisRank ?? item?.rank ?? index + 1),
    summary: String(item?.summary ?? item?.ringkasan ?? item?.deskripsi ?? "Hasil rekomendasi dari layanan SPK Python."),
    reasons: Array.isArray(item?.reasons) ? item.reasons : Array.isArray(item?.alasan) ? item.alasan : [],
    suggestedMajors: Array.isArray(item?.suggestedMajors) ? item.suggestedMajors : Array.isArray(item?.jurusan_saran) ? item.jurusan_saran : [],
    criteria: {
      academic: Number(criteria.academic ?? criteria.akademik ?? 0),
      interest: Number(criteria.interest ?? criteria.minat ?? 0),
      talentSkill: Number(criteria.talentSkill ?? criteria.bakat_skill ?? criteria.skill ?? 0),
      goalFit: Number(criteria.goalFit ?? criteria.tujuan ?? 0),
    },
    dominantFactors: Array.isArray(item?.dominantFactors) ? item.dominantFactors : Array.isArray(item?.faktor_dominan) ? item.faktor_dominan : [],
  };
}

export async function processSiswaSpk(payload: SiswaProfilePayload) {
  const response = await apiFetch<{ message: string; data: any }>("/siswa/spk", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const raw = response.data?.recommendations ?? response.data?.rekomendasi ?? response.data ?? [];
  const list = Array.isArray(raw) ? raw : [];
  return {
    message: response.message,
    recommendations: list.map(normalizeRecommendation),
  };
}

export function toStudentProfile(data: SiswaMeResponse): StudentProfileForm {
  return {
    name: data.nama ?? "",
    nisn: data.nisn ?? "",
    school: data.sekolah ?? "",
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

export async function getRoadmap(careerId: string): Promise<CareerRoadmap> {
  // Tetap lokal sampai backend roadmap tersedia.
  return {
    careerId,
    headline: "Roadmap pengembangan diri",
    targetRole: "Tahap awal sesuai rekomendasi SPK",
    initialCompleted: 0,
    steps: [
      {
        id: "step-1",
        phase: "Minggu 1-2",
        title: "Validasi pilihan dengan guru BK",
        description: "Diskusikan hasil rekomendasi, kondisi pribadi, dan pilihan lanjutan yang paling realistis.",
        duration: "2 minggu",
        output: "Catatan pilihan utama",
        checklist: ["Baca hasil rekomendasi", "Catat pertanyaan", "Diskusi dengan guru"],
      },
      {
        id: "step-2",
        phase: "Bulan 1",
        title: "Bangun portofolio awal",
        description: "Mulai satu proyek kecil yang sesuai dengan arah pilihan.",
        duration: "1 bulan",
        output: "Portofolio awal",
        checklist: ["Pilih proyek", "Kerjakan bertahap", "Dokumentasikan hasil"],
      },
    ],
  };
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
